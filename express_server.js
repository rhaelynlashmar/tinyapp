const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(cookieParser());

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// Parses data to make body readable
app.use(express.urlencoded({ extended: true }));

// Adds a table template for URL data
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username:req.cookies["username"], //fetch username from cookies
   };
  res.render("urls_index", templateVars);
});

//Adds a page with a submission form to make a new shortened URL from a longUrl
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"] 
  };
  res.render("urls_new", templateVars);
});

// Adds an URLs page with the ids of all shortened URLs and their respective longURL
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies["username"],
  };
  res.render("urls_show", templateVars);
});

// Registration page
app.get('/register', (req, res) => {
  res.render('register'); // Render the register template
});


// Helper function to generate a random ID
const generateRandomId = () => Math.random().toString(36).substring(2, 8);

// Handle POST request to /urls
app.post('/urls', (req, res) => {
  const id = generateRandomId();
  const longURL = req.body.longURL; // Extract the longURL from the form data

  // If not a valid URL sends error message
  if (!longURL) {
    res.status(404).send("404: URL not found.");
    return;
  }

  urlDatabase[id] = longURL; // Save to the database
  res.redirect(`/urls/${id}`); // Redirect to a page showing the new URL
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id; // Extract the id from the URL
  const longURL = urlDatabase[id];

  if (!longURL) {
    // If the id is not in the database, send a 404 error
    res.status(404).send("404: URL not found.");
    return;
  }

  //redirect to website directly
  res.redirect(longURL);
});

// Deleting an URL from the URLs page
app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;

  // Use the delete button to remove the id from the database
  delete urlDatabase[id];

  // Redirect back to the URLs page
  res.redirect('/urls');
});

// Editing an existing longURL
app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  const newLongURL = req.body.longURL;
  urlDatabase[id] = newLongURL; //Update the URL in the database

  res.redirect('/urls');
});

// Handle POST request to /login
app.post('/login', (req, res) => {
  const { username } = req.body; // Extract the username from the login form data
  
  if (!username) {
    res.status(400).send("400: Username is required.");
    return;
  }

  res.cookie('username', username); // Set a cookie named 'username' with the submitted value
  res.redirect('/urls'); // Redirect to the /urls page after setting the cookie
});


// Handle POST request to /logout
app.post('/logout', (req, res) => {
  res.clearCookie('username'); // Clear the username cookie
  res.redirect('/urls'); // Redirect the user to /urls
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
