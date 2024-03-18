const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }
  if (users.some(user => user.username === username)) {
    return res.status(400).json({ error: "Username already exists" });
  }
  users.push({ username, password });
  res.status(201).json({ message: "User registered successfully" });
});

public_users.get('/', (req, res) => {
    new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(books);
        }, 1000);
    })
    .then((books) => {
        res.send(JSON.stringify(books, null, 4));
    })
    .catch((err) => {
        res.status(500).send("Error retrieving books: " + err);
    });
});

public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    getBookByIsbn(isbn)
        .then((book) => {
            if (book) {
                res.send(book);
            } else {
                res.status(404).json({ error: "Book not found" });
            }
        })
        .catch((err) => {
            res.status(500).json({ error: "Internal server error: " + err });
        });
});

function getBookByIsbn(isbn) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (books.hasOwnProperty(isbn)) {
                resolve(books[isbn]);
            } else {
                resolve(null);
            }
        }, 1000);
    });
}


public_users.get('/author/:author', (req, res) => {
    const author = req.params.author;
    getBooksByAuthor(author)
        .then((booksByAuthor) => {
            if (booksByAuthor.length === 0) {
                res.status(404).json({ error: "Books by this author name not found" });
            } else {
                res.send(booksByAuthor);
            }
        })
        .catch((err) => {
            res.status(500).json({ error: "Internal server error: " + err });
        });
});

function getBooksByAuthor(author) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const isbns = Object.keys(books);
            const booksByAuthor = isbns.reduce((result, isbn) => {
                if (books[isbn].author === author) {
                    result.push(books[isbn]);
                }
                return result;
            }, []);
            resolve(booksByAuthor);
        }, 1000);
    });
}

public_users.get('/title/:title', (req, res) => {
    const title = req.params.title;
    getBookByTitle(title)
        .then(function(bookByTitle) {
            if (bookByTitle.length === 0) {
                res.status(404).json({ error: "Books by this title not found" });
            } else {
                res.send(bookByTitle);
            }
        })
        .catch((err) => {
            res.status(500).json({ error: "Internal server error: " + err });
        });
});

function getBookByTitle(title) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const isbns = Object.keys(books);
            const bookByTitle = isbns.reduce((result, isbn) => {
                if (books[isbn].title === title) {
                    result.push(books[isbn]);
                }
                return result;
            }, []);
            resolve(bookByTitle);
        }, 1000);
    });
}

public_users.get('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  if (books.hasOwnProperty(isbn) && books[isbn].hasOwnProperty('reviews')) {
    const reviews = books[isbn].reviews;
    res.send(reviews);
  } else {
    res.status(404).json({ error: "Reviews for this book not found" });
  }
});

module.exports.general = public_users;