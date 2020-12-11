// Helper Function File:

const findUserByEmail = function (email, database) {
  for (const userId in database) {
    const user = database[userId];
    if (user.email === email) {
      return user;
    }
  }
  return false;
};

module.exports = { findUserByEmail };
