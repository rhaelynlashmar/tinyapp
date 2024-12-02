const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// Parses data to make body readable
app.use(express.urlencoded({ extended: true }));

// Adds a table template for URL data
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//Adds a page with a submission form to make a new shortened URL from a longUrl
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// Adds an URLs page with the ids of all shortened URLs and their respective longURL
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});


// Helper function to generate a random ID
const generateRandomId = () => Math.random().toString(36).substring(2, 8);

// Handle POST request to /urls
app.post('/urls', (req, res) => {
    const id = generateRandomId(); 
    const longURL = req.body.longURL; // Extract the longURL from the form data
    urlDatabase[id] = longURL; // Save to the database
    
    console.log('URL added:', id, longURL); 
    
    res.redirect(`/urls/${id}`); // Redirect to a page showing the new URL 
});

app.get("/u/:id", (req, res) => {
  // const longURL = ...
  res.redirect(longURL);
});