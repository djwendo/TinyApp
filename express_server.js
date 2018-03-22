const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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
  console.log(templateVars.user);
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
      res.statusCode = 400;
    };
  };
  if (req.body.email && req.body.password) {
    var username = generateRandomString();
    users[username] = {id: username, email: req.body.email, password: req.body.password};
    res.cookie('user_id', username);
    res.redirect("/urls");
  } else {
    res.statusCode = 400;
  };
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
    res.send("You need to register.");
  };

  for (let user of Object.values(users)) {
    if (user.password === req.body.password) {
      correctPassword = true;
    };
  };

  if (!correctPassword) {
    res.statusCode = 403;
    res.send("Your password is incorrect.");
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
  let templateVars =  {user: users[req.cookies["user_id"]]};
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]],
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  var shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  let templateVars =  {user: users[req.cookies["user_id"]]};
  res.redirect(`http://localhost:8080/urls/${shortURL}`, templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
})

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  let templateVars =  {user: users[req.cookies["user_id"]]};
  res.redirect("/urls", templateVars);
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