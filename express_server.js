const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');
const saltRounds = 10;
const {findUserByEmail} = require('./helpers.js')


app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");


const generateRandomString = function () {
  const randString = Math.random().toString(36).substring(2,8);
  return randString;
};

const urlDatabase = {
  "sgq3y6": {longUrl: "http://www.lighthouselabs.ca", userID: "exampleUser1"},
  "9sm5xK": {longUrl: "http://www.google.com", userID: "exampleUser2"}
  };

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: bcrypt.hashSync("user1", saltRounds)
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: bcrypt.hashSync("user2", saltRounds)
  }
}

// GET /: Redirects to urls if logged in, if not redirects to login page.
app.get("/", (req, res) => {
  
if (users[req.session["user_id"]]) {
  res.redirect("/urls")
} else {
  res.redirect("/login")
}
});

// Console notification that the port is listening.
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

const UrlofUser = function(ID) {
  const Obj = {}
  for (const shortURL in urlDatabase) {
    const shortURLObj = urlDatabase[shortURL]
    if (shortURLObj.userID === ID) {
      Obj[shortURL] = shortURLObj
    }
  } 
  return Obj
} 

// GET /urls -> The Main Page of the Site, rendering urls_index.js.
// Displays the current logged-in User's IDs.
app.get("/urls", (req, res) => {

  const ID = req.session["user_id"]
  const user = users[ID]
  const templateVars = { urls: UrlofUser(ID), user};

  res.render("urls_index", templateVars);

  const UsersUrls = UrlofUser(ID) 
  const shortUrls = Object.keys(UsersUrls)
  
  shortUrls.forEach(shortUrl => {
    console.log(shortUrl)})
});

// The Page to create new Urls. 
// -> If the user is not logged in redirects to /login.
app.get("/urls/new", (req, res) => {

  const templateVars = {user: users[req.session["user_id"]]};
  
  if (users[req.session["user_id"]]) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login")
  }
});

// Short Url page, aka urls_show.ejs
app.get("/urls/:shortURL", (req, res) => {
  const urlLookupResult = urlDatabase[req.params.shortURL];
  const userID = req.session["user_id"];

  if(!userID) {
    return res.send("You must be logged in.");
  }

  if (!urlLookupResult) {
    return res.send("No result found for this short url.");
  }

  if (urlLookupResult.userID === userID) {
    const templateVars = { shortURL: req.params.shortURL, longURL: urlLookupResult.longUrl, user: users[req.session["user_id"]]};
    res.render("urls_show", templateVars);
  } else {
    res.send("You do not have permission to view this page.")
  }
});

app.post("/urls", (req, res) => {

  const userID = req.session["user_id"]
  const randomString = generateRandomString()  
  urlDatabase[randomString] = {longUrl: req.body.longURL, userID} 
  res.redirect('/urls')

});

// 
app.get("/u/:shortURL", (req, res) => {
  const urlLookupResult = urlDatabase[req.params.shortURL];

  if (!urlLookupResult) {
    return res.send("No result found for this short url.");
  } else {
    res.redirect(urlLookupResult.longUrl);
  }

});

app.post("/urls/:shortURL/delete", (req,res) => {
  const UserID = req.session["user_id"]
  const shortURLtoDelete = req.params.shortURL
  const ShortDelete = urlDatabase[shortURLtoDelete]
  
  if (ShortDelete && UserID === ShortDelete.userID) {
    delete urlDatabase[shortURLtoDelete]
    res.redirect("/urls")
  } else {
    res.status(400).send('<h1>You do not own this Url!</h1>')
}

})

app.post("/urls/:shortURL", (req, res) => {

  if (users[req.session.user_id]) {
    urlDatabase[req.params.shortURL].longUrl = req.body.longUrl;
    res.redirect("/urls");
  } else {
    res.status(405).send("Error: You don't have permission to do that!");
  }
});


app.get("/register", (req, res) => {
  const templateVars = {user: users[req.session["user_id"]]};
  res.render("register", templateVars)
})

//* THIS STEP CREATES A NEW USER: 

app.post("/register", (req,res) => {

  const newuserId = generateRandomString()
// 1. Extract the user info from the form.
  const email = req.body.email
  const password = req.body.password

// Step 1.5: Check that the email doesn't already exist in the users database.  

const user = findUserByEmail(email, users)
if (user) {
  return res.status(400).send('User already exists')
}
  
if (email === '' || password === '') {
  return res.status(400).send('One or more fields are empty')
}

// 2. Create a new user object
  const newUser = {
    id: newuserId, 
    email: email, 
    password: bcrypt.hashSync(password, saltRounds)
  }
// 3. Add the new user object to the global users database 
users[newuserId] = newUser;

// 4. Set the user_id in the cookie

req.session["user_id"] = newuserId

// 5. redirect to "/urls"
res.redirect("/urls")


})

// The Login Page
app.get("/login", (req, res) => {
  const templateVars = {user: users[req.session["user_id"]]};
  res.render("login", templateVars);
})

app.post("/login", (req, res) => {
  
// 1st step is get email and password from the form
const email = req.body.email
const password = req.body.password
// 2nd step is retrieve the user from the database by email.
const user = findUserByEmail(email, users);
// 3rd step once we retreive the user we need to check if the password checks out. 

if (!user) {
  return res.send("Wrong email or password")
} 
if (!bcrypt.compareSync(password, user.password)) {
  return res.send("Password or email don't match")
} 
  req.session["user_id"] = user.id
  res.redirect("/urls");
})

app.post("/logout", (req, res) => {
  
  req.session = null;  
  res.redirect("/urls")
})


// If someone is not logged when clicking on my urls/new/, redirect to the login page

