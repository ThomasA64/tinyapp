const findUserByEmail = function(email, database) {
  //* Refactor to take in users database
  // 1st step: 
  for (const userId in database) {
   const user = database[userId];
   if (user.email === email) {
     return user
   }
  } 
  return false
}

module.exports = {findUserByEmail}