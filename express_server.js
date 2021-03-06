const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require("cookie-session");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  secret: 'wendyisthebest'
}))

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": {
    urlID: "b2xVn2",
    url: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    urlID: "9sm5xK",
    url: "http://www.google.com",
    userID: "user2RandomID"
  }
}

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}
//Generates random 6 digit strings used for both ShortURLs/urlID and userID
function generateRandomString() {
  return Math.random().toString(36).substr(2,6)
}

//Generates a list of short urls by specific user. Allows users to access only their own shortened urls.
function urlsForUser(user_id) {
  var usersURLs = {};
  for (var url_id in urlDatabase) {
    var urlObject = urlDatabase[url_id];
    if (urlObject.userID === user_id) {
      usersURLs[url_id] = urlObject
    }
  };
  return usersURLs;
};

//Main page: If registered/logged in, will display list of user's short urls. If not, will encourage user to login.
app.get("/urls", (req, res) => {
  if (req.session.user_id) {
    urlsForUser(req.session.user_id);
  }
  let templateVars =  {
    urls: urlsForUser(req.session.user_id),
    user: users[req.session.user_id]
  };
  res.render("urls_index", templateVars);
});

//Registration form. If user is already logged in, returns "You are already logged in." message.
app.get("/register", (req, res) => {
  let templateVars =  {
    user: users[req.session.user_id]
  };
  res.render("urls_register", templateVars);
});

//Submits user registration form checking for valid email and password.
//Password is encrypted using bcrypt.
app.post("/register", (req, res) => {
  for (let user of Object.values(users)) {
    if (user.email === req.body.email) {
      res.sendStatus(400);
    }
  }

  if (req.body.email && req.body.password) {
    var username = generateRandomString();
    var hashedPassword = bcrypt.hashSync(req.body.password, 10);
    users[username] = {id: username, email: req.body.email, password: hashedPassword};
    req.session.user_id = username;
    res.redirect("/urls");
  } else {
    res.sendStatus(400);
  }
});

//Login page. If already logged in, returns "You are already loggin in." message.
app.get("/login", (req, res) => {
  let templateVars =  {
    user: users[req.session.user_id]
    };
  res.render("urls_login", templateVars);
});

//Submits login form checking for valid email and password.
//Compares bcrypt encrypted password to what was submitted by user during login.
app.post("/login", (req, res) => {
  let registeredEmail;
  let correctPassword;
  let userID;

  for (let user of Object.values(users)) {
    if (user.email === req.body.email) {
      registeredEmail = true;
      userID = user.id;
    }
  }

  for (let user of Object.values(users)) {
    if (bcrypt.compareSync(req.body.password, user.password)) {
      correctPassword = true;
    }
  }

  if (registeredEmail === true && correctPassword === true) {
    req.session.user_id = userID;
    res.redirect("/urls");
  } else {
    res.sendStatus(400);
  }
});


//Logs user out, deletes session cookies (set to null), and redirects to "/urls".
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//When a new url is shortened, takes user to page for that short URL.
//User can edit or share the url from this page.
app.get("/urls/new", (req, res) => {
  if (users[req.session.user_id]) {
    let templateVars =  {user: users[req.session.user_id]};
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

//Individual page for each shortened URL.
app.get("/urls/:id", (req, res) => {

  if (urlDatabase[req.params.id]) {
    let templateVars = {
      user: users[req.session.user_id],
      userID: req.session.user_id,
      shortURL: req.params.id,
      longURL: urlDatabase[req.params.id].url,
      creatingUser: urlDatabase[req.params.id].userID
    };
    res.render("urls_show", templateVars);
  } else {
    res.sendStatus(404);
  }
});

//Creating a new shortened URL generates a random 6-digit shortURL and adds the URL
//to the urlDatabase while redirecting the user to a sub-page that allows the user to edit
//their new shortened URL.
app.post("/urls", (req, res) => {
  var shortURL = generateRandomString();
  urlDatabase[shortURL] = { urlID: shortURL, url: req.body.longURL, userID: req.session.user_id };
  res.redirect(`/urls/${shortURL}`);
});

//Redirects to the original/longURL the shortened URL was created from.
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].url;
  res.redirect(longURL);
})

//Deletes a shortened URL. Only the user who created the shortened URL can delete it.
app.post("/urls/:id/delete", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.id].userID) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  } else {
    res.redirect("/urls");
  }
})

//Individual page for each shortURL. User who created the URL can edit the URL from this page.
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id].url = req.body.newURL;
  res.redirect("/urls");
})

//Logged in users will see a list of their shortURLs, otherwise users will be redirected to the login page.
app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});