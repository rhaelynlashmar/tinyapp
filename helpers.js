// Function to find a user by email
const findUserByEmail = (email, users) => {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
};


// Function to generate a random ID
const generateRandomId = () => Math.random().toString(36).substring(2, 8);


// Function to filter URLs by user ID
const urlsForUser = (id, urlDatabase) => {
  const userUrls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls;
};


module.exports = { findUserByEmail, generateRandomId, urlsForUser };