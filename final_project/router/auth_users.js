const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (userName)=>{ //returns boolean
  const user_exist = users.filter(user => user.userName === userName);

  return user_exist.length > 0;
}

const authenticatedUser = (userName,password)=>{ //returns boolean
  const user_exist = users.filter(user => user.userName === userName && user.password === password);

  return user_exist.length > 0;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const userName = req.body.userName;
  const password = req.body.password;

  if (!userName || !password){
      return res.status(404).send("Unable to login");
  }else{
      if (authenticatedUser(userName,password)){
          let accessToken = jwt.sign(
              {data : password},
              "access" ,
              {expiresIn : 60*60}
          );

          req.session.authorization = {
              accessToken, userName
          };

          return res.status(202).send("User successfully logged in");
      }else{
          return res.status(208).json({ message: "Invalid Login. Check username and password" });
      }
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;  
    const userName = req.session.authorization["userName"];  
    const review = req.query.reviews;  

    if (!books[isbn]) {
        return res.status(404).send("Book not found.");
    }

    if (books[isbn].reviews[userName]) {
        books[isbn].reviews[userName] = review;  
        return res.send("Review has been updated!");
    }

    books[isbn].reviews[userName] = review;  
    return res.send("Review has been added!");
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn; 
  const userName = req.session.authorization["userName"]; 

  if (books[isbn]) {
      if (books[isbn].reviews[userName]) {
          delete books[isbn].reviews[userName];
          return res.send("Review deleted successfully!");
      } else {
          return res.status(404).json({ message: "Review not found for this user." });
      }
  } else {
      return res.status(404).json({ message: "Book not found." });
  }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
