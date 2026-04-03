const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username) => {
    let userswithsamename = users.filter((user) => {
        return user.username === username
    });
    return userswithsamename.length > 0;
}

// --- PUBLIC ROUTES (REGISTRATION & REVIEWS) ---

public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        if (!doesExist(username)) {
            users.push({ "username": username, "password": password });
            return res.status(200).json({ message: "User successfully registred. Now you can login" });
        } else {
            return res.status(404).json({ message: "User already exists!" });
        }
    }
    return res.status(404).json({ message: "Unable to register user." });
});

public_users.get('/review/:isbn', function (req, res) {
    const ISBN = req.params.isbn;
    if (books[ISBN]) {
        res.send(books[ISBN].reviews);
    } else {
        res.status(404).json({ message: "Book not found" });
    }
});

// --- ASYNC/PROMISE ROUTES (TASKS 10-13) ---

// Task 10: Get book list
const getBookList = () => {
    return new Promise((resolve) => {
        resolve(books);
    });
};

public_users.get('/', function (req, res) {
    getBookList().then(
        (bk) => res.status(200).send(JSON.stringify(bk, null, 4)),
        (error) => res.status(500).send("Internal Server Error")
    );
});

// Task 11: Get book details based on ISBN
const getFromISBN = (isbn) => {
    return new Promise((resolve, reject) => {
        let book = books[isbn];
        if (book) {
            resolve(book);
        } else {
            reject({ status: 404, message: `Book with ISBN ${isbn} not found` });
        }
    });
};

public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    getFromISBN(isbn)
        .then((book) => res.status(200).send(JSON.stringify(book, null, 4)))
        .catch((err) => res.status(err.status || 500).json({ message: err.message }));
});

// Task 12: Get book details based on Author
const getFromAuthor = (author) => {
    return new Promise((resolve, reject) => {
        let authorBooks = Object.values(books).filter(b => b.author === author);
        if (authorBooks.length > 0) {
            resolve(authorBooks);
        } else {
            reject({ status: 404, message: `No books found by author ${author}` });
        }
    });
};

public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    getFromAuthor(author)
        .then((result) => res.status(200).send(JSON.stringify(result, null, 4)))
        .catch((err) => res.status(err.status || 500).json({ message: err.message }));
});

// Task 13: Get book details based on Title
const getFromTitle = (title) => {
    return new Promise((resolve, reject) => {
        let titleBooks = Object.values(books).filter(b => b.title === title);
        if (titleBooks.length > 0) {
            resolve(titleBooks);
        } else {
            reject({ status: 404, message: `No books found with title ${title}` });
        }
    });
};

public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    getFromTitle(title)
        .then((result) => res.status(200).send(JSON.stringify(result, null, 4)))
        .catch((err) => res.status(err.status || 500).json({ message: err.message }));
});

module.exports.general = public_users;
