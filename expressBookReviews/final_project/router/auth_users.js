const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [{
    username: "user",
    password: "0123"
}];

const isValid = (username)=>{
    const minLength = 3;
    const maxLength = 20;
    if (!username) {
        throw new Error('Username is required');
    }
    if (username.length < minLength || username.length > maxLength) {
        throw new Error('Username length must be between 3 and 20 characters');
    }
    return true;
}

const authenticatedUser = (username,password)=>{
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password)
    })
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
      return res.status(404).json({message: "Error logging in"});
  }
 if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });
    req.session.authorization = {
      accessToken,username
  }
  return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }});

regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.username;

  if (!review) {
    return res.status(404).json({message: "Review is required"})
  }
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" })
  }
  if (books[isbn].reviews[username]) {
    books[isbn].reviews[username] = review;
    return res.status(200).json({ message: "Review updated successfully" });
} else {
    books[isbn].reviews[username] = review;
    return res.status(201).json({ message: `Review for the book with isbn ${isbn} added successfully`});
}

});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.username;
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }
    if (!books[isbn].reviews[username]) {
        return res.status(404).json({ message: "Review not found for the current user" });
    }
    delete books[isbn].reviews[username];
    return res.status(200).json({ message: `Review for the book with isbn ${isbn} deleted successfully` })
})



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;