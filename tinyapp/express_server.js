const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.use(cookieParser());

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

const findUserByEmail = function(email) {
  // 1st step: 
  for (const userId in users) {
   const user = users[userId];
   if (user.email === email) {
     return user
   }
  } 
  return false
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

  const templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]]};
  console.log("user",templateVars.user);
  console.log(users);
  console.log(req.cookies)

  res.render("urls_index", templateVars);
  // console.log(req.cookies("user_id"));
});

app.get("/urls/new", (req, res) => {
  const templateVars = {user: users[req.cookies["user_id"]]};
  res.render("urls_new");
});

// In our request object, we need req.params and req.body
// this route is going to lead us to our short URL page, aka urls_show
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies["user_id"]]};
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

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longUrl
  res.redirect("/urls/" + req.params.shortURL)
})

app.get("/register", (req, res) => {
  const templateVars = {user: users[req.cookies["user_id"]]};
  res.render("register")
})

app.post("/register", (req,res) => {
  console.log(req.body, "req");
  const newuserId = generateRandomString()
// 1. Extract the user info from the form.
  const email = req.body.email
  const password = req.body.password

// Step 1.5: Check that the email doesn't already exist in the users database.  
const emailCheck = findUserByEmail(email);
if (emailCheck.email === email) {
  return res.send('404 Email already taken')
}

// 2. Create a new user object
  const newUser = {
    id: newuserId, 
    email: email, 
    password: password
  }
// 3. Add the new user object to the global users database 
users[newuserId] = newUser;
// 4. Set the user_id in the cookie
res.cookie("user_id", newuserId)
// 5. redirect to "/urls"
console.log(newuserId);
res.redirect("/urls");

})

app.get("/login", (req, res) => {
  res.render("login");
})

app.post("/login", (req, res) => {
  
// 1st step is get email and password from the form
const email = req.body.email
const password = req.body.password
// 2nd step is retrieve the user from the database by email.
const user = findUserByEmail(email);
// 3rd step once we retreive the user we need to check if the password checks out. 
if (user.password === password) {
  res.cookie("user_id", user.id)
  res.redirect("/urls");
} else {
  return res.send("Wrong credential")
}
// 4th step write to the cookie
// 
//   
})

app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect("/urls")
})
