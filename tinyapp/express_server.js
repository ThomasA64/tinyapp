const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

app.use(cookieParser())

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");


const generateRandomString = function () {
  const randString = Math.random().toString(36).substring(2,8);
  return randString;
};

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

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"]};
  res.render("urls_index", templateVars);
  // console.log(req.cookies("User_id"));
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// In our request object, we need req.params and req.body
// this route is going to lead us to our short URL page, aka urls_show
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  console.log(req.params)
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  // res.send("Ok");  
  const randomString = generateRandomString()  
  urlDatabase[randomString] = req.body.longURL 
  res.redirect('/urls')
  // Respond with 'Ok' (we will replace this)
});

app.get("/u/:shortURL", (req, res) => {
  console.log('url',urlDatabase);
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req,res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls")
})

app.get("/register", (req, res) => {
  res.render("register")
})

app.post("/register", (req,res) => {
  console.log(req.body, "req");
  const newuserId = generateRandomString()
  users[newuserId] = {id: newuserId, email: req.body.email, password: req.body.password};
  console.log(users);
  res.cookie("User_id", newuserId);
  res.redirect("/urls")
})

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username)
  res.redirect("/urls")
  // res.cookie("username", users["email", "password"])
  // Get the form data from the request, email and password
  // Authenticate the user
  // If the user authenicates successfully, then we should send them a cookie, if not send them back an error.
  // res.redirect("/urls")
})

app.post("/logout", (req, res) => {
  res.clearCookie("username")
  res.redirect("/urls")
})