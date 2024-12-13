const express = require("express");
const app = express();
const cookieSession = require("cookie-session");
const bcrypt = require('bcryptjs');
const { findUserByEmail, generateRandomId, urlsForUser } = require('./helpers');
const { users, urlDatabase } = require('./databases');
const saltRounds = 10;
const PORT = 8080; // default port 8080


// ----------Middleware set up----------
app.set("view engine", "ejs"); // Set the view engine to EJS
app.use(cookieSession({
  name: 'session',
  keys: ['secretKey', 'anotherSecretKey'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.use(express.urlencoded({ extended: true })); // Parses data to make body readable




// ----------Routes----------

// Adds a table template for URL data
app.get("/urls", (req, res) => {
  const user = users[req.session.user_id]; // Get the user from the session "cookie"
  if (!user) { // If the user is not logged in, send a 403 error
    res.status(403).send(`<h1>403: You must be logged in to view URLs.<h1>`);
    return;
  }
  const userUrls = urlsForUser(user.id, urlDatabase); // Filter the URLs by user ID
  const templateVars = {
    urls: userUrls, // Pass the filtered URL database to the template
    user,
  };
  res.render("urls_index", templateVars);
});

// Page with a submission form to make a new shortened URL from a longUrl
app.get("/urls/new", (req, res) => {
  const user = users[req.session.user_id]; // Get the user from the session "cookie"
  if (!user) {
    res.redirect('/login');
    return;
  }
  const templateVars = {
    user,
  };
  res.render("urls_new", templateVars);
});

// An URLs page with the ids of all shortened URLs and their respective longURL
app.get("/urls/:id", (req, res) => {
  const user = users[req.session.user_id];
  const url = urlDatabase[req.params.id]; // Get the URL from the database
  if (!user) {
    res.status(403).send(`<h1>403: You must be logged in to view URLs.<h1>`);
    return;
  }
  if (!url) { // If the URL is not in the database, send a 404 error
    res.status(404).send(`<h1>404: URL not found.<h1>`);
    return;
  }
  if (url.userID !== user.id) { // If the user is not the owner, send a 403 error
    res.status(403).send(`<h1>403: You must be the owner to view URLs.<h1>`);
    return;
  }
  const templateVars = {
    id: req.params.id,
    longURL: url.longURL, // Get the longURL from the database
    user,
  };
  res.render("urls_show", templateVars);
});

// Registration page
app.get('/register', (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    res.redirect('/urls');
    return;
  }
  const templateVars = {
    user,
  };
  res.render('register', templateVars); // render the register template
});

app.get('/login', (req, res) => {
  const user = users[req.session.user_id]; // Get the user from the session "cookie"
  if (user) {
    res.redirect('/urls');
    return;
  }
  const templateVars = {
    user,
  };
  res.render('login', templateVars); // render the login template
});




// ----------POST requests----------

// Handle POST request to /urls
app.post('/urls', (req, res) => {
  const user = users[req.session.user_id]; // Get the user from the cookie
  if (!user) {
    res.status(403).send(`<h1>403: Unauthorized access, You must be logged in to shorten URLs.<h1>`);
    return;
  }
  const id = generateRandomId();
  const longURL = req.body.longURL; // Extract the longURL from the form data

  // If not a valid URL sends error message
  if (!longURL) {
    res.status(404).send(`<h1>404: URL not found.<h1>`);
    return;
  }

  urlDatabase[id] = { longURL, userID: user.id }; // Save to the database
  res.redirect(`/urls/${id}`); // Redirect to a page showing the new URL
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id; // Extract the id from the URL
  const url = urlDatabase[id]; // Get the longURL from the database

  if (!url) {
    // If the id is not in the database, send a 404 error
    res.status(404).send(`
      <html>
        <head>
          <title>404 URL Not Found</title>
        </head>
        <body>
          <h1>404: URL not found.</h1>
          <p>The URL you are looking for does not exist.</p>
        </body>
      </html>
      `);
    return;
  }
  //redirect to website directly
  res.redirect(url.longURL);
});

// Deleting an URL from the URLs page
app.post('/urls/:id/delete', (req, res) => {
  const user = users[req.session.user_id]; // Get the user from the cookie
  const id = req.params.id;

  if (!user) { // If the user is not logged in, send a 403 error
    res.status(403).send(`<h1>403: You must be logged in to delete URLs.<h1>`);
    return;
  }
  if (!urlDatabase[id]) { // If the id is not in the database, send a 404 error
    res.status(404).send(`<h1>404: URL not found.<h1>`);
    return;
  }
  if (urlDatabase[id].userID !== user.id) { // If the user is not the owner, send a 403 error
    res.status(403).send(`<h1>403: You must be the owner to delete URLs.<h1>`);
    return;
  }


  // Use the delete button to remove the id from the database
  delete urlDatabase[id];

  // Redirect back to the URLs page
  res.redirect('/urls');
});

// Editing an existing longURL
app.post('/urls/:id', (req, res) => {
  const user = users[req.session.user_id];
  const id = req.params.id;
  const newLongURL = req.body.longURL;

  if (!user) {
    res.status(403).send(`<h1>403: Unauthorized access, You must be logged in to edit URLs.</h1>`);
    return;
  }
  // check if the id is in the database
  if (!urlDatabase[id]) {
    res.status(404).send(`<h1>404: URL not found.</h1>`);
    return;
  }
  // check if the user is the owner of the URL
  if (urlDatabase[id].userID !== user.id) {
    res.status(403).send(`<h1>403: You must be the owner to edit URLs.</h1>`);
    return;
  }

  urlDatabase[id].longURL = newLongURL; // Update the URL in the database

  res.redirect('/urls');
});



// Handle POST request to /register
app.post('/register', (req, res) => {
  const { email, password } = req.body;

  // If email or password is missing, send a 400 error
  if (!email || !password) {
    res.status(400).send(`<h1>400: Email or Password is missing.</h1>`);
    return;
  }

  // If the email is already registered, send a 400 error
  if (findUserByEmail(email, users)) {
    res.status(400).send(`<h1>400: Email already exists.</h1>`);
    return;
  }

  // Hash the password
  const hashedPassword = bcrypt.hashSync(password, saltRounds);

  // Create a new user
  const id = generateRandomId();
  const newUser = {
    id,
    email,
    password: hashedPassword, // Save the hashed password
  };

  users[id] = newUser;
  
  req.session.user_id = id; // Set the user_id cookie
  res.redirect('/urls'); // Redirect to the /urls page
});

// Handle POST request to /login
app.post('/login', (req, res) => {
  const { email, password } = req.body; // Extract the email & password from the login form data
  const user = findUserByEmail(email, users); // Find the user by email
  
  if (!user || !bcrypt.compareSync(password, user.password)) { // Compare the password to the hashed password
    res.status(400).send(`<h1>400: Email or Password is incorrect.</h1>`);
    return;
  }

  req.session.user_id = user.id; // Set the user_id cookie
  res.redirect('/urls'); // Redirect to the /urls page after setting the cookie
});

// Handle POST request to /logout
app.post('/logout', (req, res) => {
  req.session = null; // Clear the cookie
  res.redirect('/login'); // Redirect the user to /urls
});


// ----------Server Startup----------
// Open the server on PORT
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
