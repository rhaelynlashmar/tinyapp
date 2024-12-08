const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const PORT = 8080; // default port 8080


// Middleware set up
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.urlencoded({ extended: true })); // Parses data to make body readable



// Database of users and URLs
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};



// Function to generate a random ID
const generateRandomId = () => Math.random().toString(36).substring(2, 8);

// Function to find a user by email
const findUserByEmail = (email) => {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
};





// Adds a table template for URL data
app.get("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]]; // Get the user from the cookie
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user,
  };
  res.render("urls_index", templateVars);
});

// Page with a submission form to make a new shortened URL from a longUrl
app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]];
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
  const user = users[req.cookies["user_id"]];
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user,
  };
  res.render("urls_show", templateVars);
});

// Registration page
app.get('/register', (req, res) => {
  const user = users[req.cookies["user_id"]];
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
  const user = users[req.cookies["user_id"]];
  if (user) {
    res.redirect('/urls');
    return;
  }
  const templateVars = {
    user,
  };
  res.render('login', templateVars); // render the login template
});





// Handle POST request to /urls
app.post('/urls', (req, res) => {
  const user = users[req.cookies["user_id"]]; // Get the user from the cookie
  if (!user) {
    res.status(403).send(`<h1>403: Unauthorized access, You must be logged in to shorten URLs.<h1>`);
    return;
  }
  const id = generateRandomId();
  const longURL = req.body.longURL; // Extract the longURL from the form data

  // If not a valid URL sends error message
  if (!longURL) {
    res.status(404).send("404: URL not found.");
    return;
  }

  urlDatabase[id].longUrl = longURL; // Save to the database
  res.redirect(`/urls/${id}`); // Redirect to a page showing the new URL
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id; // Extract the id from the URL
  const longURL = urlDatabase[id].longUrl;

  if (!longURL) {
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
  res.redirect(longURL);
});

// Deleting an URL from the URLs page
app.post('/urls/:id/delete', (req, res) => {
  const user = users[req.cookies["user_id"]]; // Get the user from the cookie
  if (!user) {
    res.status(403).send(`<h1>403: Unauthorized access, You must be logged in to delete URLs.<h1>`);
    return;
  }

  const id = req.params.id;

  // Use the delete button to remove the id from the database
  delete urlDatabase[id].longUrl;

  // Redirect back to the URLs page
  res.redirect('/urls');
});

// Editing an existing longURL
app.post('/urls/:id', (req, res) => {
  const user = users[req.cookies["user_id"]]; // Get the user from the cookie
  if (!user) {
    res.status(403).send(`<h1>403: Unauthorized access, You must be logged in to edit URLs.</h1>`);
    return; 
  }

  const id = req.params.id;
  const newLongURL = req.body.longURL;
  urlDatabase[id].longUrl = newLongURL; // Update the URL in the database

  res.redirect('/urls');
});

// Handle POST request to /login
app.post('/login', (req, res) => {
  const { email, password } = req.body; // Extract the email & password from the login form data
  const user = findUserByEmail(email); // Find the user by email
  
  if (!user || user.password !== password) {
    res.status(403).send("403: Either email or password is incorrect.");
    return;
  }

  res.cookie('user_id', user.id); // Set a cookie named 'user_id' with the submitted value
  res.redirect('/urls'); // Redirect to the /urls page after setting the cookie
});

// Handle POST request to /register
app.post('/register', (req, res) => {
  const { email, password } = req.body;

  // If email or password is missing, send a 400 error
  if (!email || !password) {
    res.status(400).send("400: Email and Password are required.");
    return;
  }

  // If the email is already registered, send a 400 error
  if (findUserByEmail(email)) {
    res.status(400).send("400: Email already Registered.");
    return;
  }

  // Create a new user
  const id = generateRandomId();
  const newUser = {
    id,
    email,
    password,
  };

  users[id] = newUser;
  
  res.cookie('user_id', id); // Set a cookie containing the user's ID
  res.redirect('/urls'); // Redirect to the /urls page
});

// Handle POST request to /logout
app.post('/logout', (req, res) => {
  res.clearCookie('user_id'); // Clear the user_id cookie
  res.redirect('/login'); // Redirect the user to /urls
});





app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
