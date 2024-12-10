const { assert } = require('chai');
const { findUserByEmail, urlsForUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "[email protected]",
    password: "pmd"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "[email protected]",
    password: "dishwasher-funk"
  }
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "user2RandomID",
  },
};


// ---------Test cases for findUserByEmail---------
describe('findUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("[email protected]", testUsers);
    const expectedUserID = "userRandomID";
    assert.strictEqual(user.id, expectedUserID);
  });
  it('should return null for a non-existent email', function() {
    const user = findUserByEmail(null, testUsers);
    assert.isNull(user);
  });
});


// ---------Test cases for urlsForUser---------
describe('urlsForUser', function() {
  it('should return urls that belong to the specified user', function() {
    const userUrls = urlsForUser("userRandomID", urlDatabase);
    const expectedUrls = {
      b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" }
    };
    assert.deepEqual(userUrls, expectedUrls);
  });

  it('should return an empty object if the urlDatabase does not contain any urls that belong to the specified user', function() {
    const userUrls = urlsForUser("nonExistentUser", urlDatabase);
    assert.deepEqual(userUrls, {});
  });

  it('should return an empty object if the urlDatabase is empty', function() {
    const userUrls = urlsForUser("userRandomID", {});
    assert.deepEqual(userUrls, {});
  });

  it('should not return any urls that do not belong to the specified user', function() {
    const userUrls = urlsForUser("userRandomID", urlDatabase);
    assert.notProperty(userUrls, "i3BoGr");
  });
});