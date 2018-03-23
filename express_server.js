const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

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

app.get("/urls", (req, res) => {
  let templateVars =  {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  let templateVars =  {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  for (let user of Object.values(users)) {
    if (user.email === req.body.email) {
      res.statusCode = 401;
      res.redirect("urls_register");
    };
  };
  if (req.body.email && req.body.password) {
    var username = generateRandomString();
    users[username] = {id: username, email: req.body.email, password: req.body.password};
    res.cookie('user_id', username);
    res.redirect("/urls");
  } else {
    res.statusCode = 400;
    res.redirect("urls_register");
  };
  console.log("user info when registered", users[username]);
  console.log("id after registering:", users[username].id)
});

app.get("/login", (req, res) => {
  let templateVars =  {user: req.cookies["user_id"]};
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  let registeredEmail;
  let correctPassword;
  let userID;

  for (let user of Object.values(users)) {
    if (user.email === req.body.email) {
      registeredEmail = true;
      userID = user.id;
    };
  };

  if(!registeredEmail) {
    res.statusCode = 401;
    res.redirect("/register");
  };

  for (let user of Object.values(users)) {
    if (user.password === req.body.password) {
      correctPassword = true;
    };
  };

  if (!correctPassword) {
    res.statusCode = 403;
    res.redirect("/login");
  };

  if (registeredEmail === true && correctPassword === true) {
    res.cookie('user_id', userID);
    res.redirect("/urls");
  };
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {

  if (users[req.cookies["user_id"]]) {
    let templateVars =  {user: users[req.cookies["user_id"]]};
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]],
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].url,
    creatingUser: urlDatabase[req.params.id].userID
  };
  console.log("tempVars on id page:", templateVars);
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  var shortURL = generateRandomString();
  urlDatabase[shortURL] = { urlID: shortURL, url: req.body.longURL, userID: req.cookies["user_id"] };
  console.log("details of new entry:", urlDatabase[shortURL]);
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
})


//deleting a shortened URL
app.post("/urls/:id/delete", (req, res) => {

console.log("user info:", req.cookies["user_id"]);
console.log("user creating URL:", urlDatabase[req.params.id].userID);

  if (req.cookies["user_id"] === urlDatabase[req.params.id].userID) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  } else {
    res.redirect("/urls");
  }
})

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.newURL;
  res.redirect("/urls");
})



app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  return Math.random().toString(36).substr(2,6)
}