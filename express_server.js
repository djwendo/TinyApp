const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

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

app.set("view engine", "ejs");


app.get("/urls", (req, res) => {
  let templateVars =  {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars =  {username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  let templateVars =  {
    username: req.cookies["username"]
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {

  if (req.body.email == false || req.body.password == false) {
    res.statusCode = 400;
    res.send("Email or password cannot be empty.")
  };

  for (let user of Object.values(users)) {
    if (user.email === req.body.email) {
      res.statusCode = 400;
      res.send("Email already exists.")
    };
  };

  var username = generateRandomString();
  users[username] = {id: username, email: req.body.email, password: req.body.password};
  res.cookie('user_id', username);
  res.redirect("/urls");
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  var shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  let templateVars =  {username: req.cookies["username"]};
  res.redirect(`http://localhost:8080/urls/${shortURL}`, templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
})

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  let templateVars =  {username: req.cookies["username"]};
  res.redirect("/urls", templateVars);
})

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.newURL;
  res.redirect("/urls");
})

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
});

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