const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require("axios");


public_users.post("/register", (req,res) => {
  userName = req.body.userName;
  password = req.body.password;

  if (!userName || !password){
    return res.send('Unable to register');
  }else{
    if (!isValid(userName)){
      users.push({
        "userName" : userName,
        "password" : password
      });
      return res.send("User successfully registered. Now you can login")
    }else{
      return res.send("User already exists")
    }
  }
});

public_users.get('/', (req, res) => {
  return new Promise((resolve, reject) => {
    const booksData = books; 
    if (booksData) {
        resolve(res.send(JSON.stringify(booksData, null, 4))); 
    } else {
        reject(new Error("Error retrieving books data.")); 
    }
  })
  .catch((error) => {
      return res.status(500).send(error.message); 
  });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', (req, res) => {
  return new Promise((resolve, reject) => {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (book) {
      resolve(res.send(book));
    } else {
      reject(new Error("Error retrieving books data."));
    }
  })
  .catch((error) => {
    return res.status(500).send(error.message); 
  });
});

  
// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
  try {
    const author = req.params.author;
    const filtered_book = {};

    await new Promise((resolve) => {
      Object.entries(books).forEach(([isbn, book]) => {
        if (book.author === author) {
          filtered_book[isbn] = book;
        }
      });
      resolve(); 
    });

    return res.send(filtered_book);
  } catch (error) {
    return res.status(500).send("Error retrieving books by author.");
  }
});

// Get all books based on title
public_users.get('/title/:title', (req, res) => {
  const title = req.params.title;
  const filtered_book = {};

  new Promise((resolve) => {
    Object.entries(books).forEach(([isbn, book]) => {
      if (book.title === title) {
        filtered_book[isbn] = book; 
      }
    });
    resolve(); 
  })
  .then(() => {
    return res.send(filtered_book);
  })
  .catch((error) => {
    console.error("Error retrieving books by title:", error);
    return res.status(500).send("Error retrieving books by title.");
  });
});

//  Get book review
public_users.get('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;

  new Promise((resolve, reject) => {
    const reviews = books[isbn].reviews;

    if (reviews) {
      resolve(reviews); 
    } else {
      reject("Reviews not found."); 
    }
  })
  .then((reviews) => {
    return res.send(reviews); 
  })
  .catch((error) => {
    console.error("Error retrieving reviews:", error);
    return res.status(404).send(error); 
  });
});

module.exports.general = public_users;
