const { assert } = require('chai');
const { findUserByEmail } = require('../helpers.js');

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

describe('findUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("[email protected]", testUsers)
    const expectedUserID = "userRandomID";
    assert.strictEqual(user.id, expectedUserID);
  });
  it('should return null for a non-existent email', function() {
    const user = findUserByEmail(null, testUsers);
    assert.isNull(user);
  });
});