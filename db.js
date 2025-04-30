// db.js
require('dotenv').config();              // loads .env

const { createClient } = require('@libsql/client');

const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

module.exports = db;

























//const sqlite3 = require('sqlite3').verbose();
//const path = require('path');

//const db_name = path.join(__dirname, 'database.sqlite');
//const db = new sqlite3.Database(db_name, (err) => {
//    if (err) {
//        console.error("Error opening database:", err.message);
//    } else {
//        console.log("Connected to SQLite database.");
//    }
//});

//// Create Users table
//db.run(`CREATE TABLE IF NOT EXISTS Users (
//    id INTEGER PRIMARY KEY AUTOINCREMENT,
//    name TEXT,
//    email TEXT UNIQUE,
//    password_hash TEXT,
//    role TEXT DEFAULT 'user'
//)`, (err) => {
//    if (err) {
//        console.error("Error creating Users table:", err.message);
//    } else {
//        console.log("Users table created or already exists.");
//    }
//});

//// Create Products table
//db.run(`CREATE TABLE IF NOT EXISTS Products (
//    id INTEGER PRIMARY KEY AUTOINCREMENT,
//    name TEXT,
//    description TEXT,
//    price REAL,
//    stock INTEGER,
//    imagePath TEXT
//)`, (err) => {
//    if (err) {
//        console.error("Error creating Products table:", err.message);
//    } else {
//        console.log("Products table created or already exists.");
//    }
//});

//// Create Orders table
//db.run(`CREATE TABLE IF NOT EXISTS Orders (
//    id INTEGER PRIMARY KEY AUTOINCREMENT,
//    user_id INTEGER,
//    product_id INTEGER,
//    quantity INTEGER,
//    shipping_name TEXT,
//    shipping_address TEXT,
//    order_date TEXT,
//    status TEXT DEFAULT 'pending',
//    FOREIGN KEY (user_id) REFERENCES Users(id),
//    FOREIGN KEY (product_id) REFERENCES Products(id)
//)`, (err) => {
//    if (err) {
//        console.error("Error creating Orders table:", err.message);
//    } else {
//        console.log("Orders table created or already exists.");
//    }
//});

//// Create Messages table
//db.run(`CREATE TABLE IF NOT EXISTS Messages (
//    id INTEGER PRIMARY KEY AUTOINCREMENT,
//    user_id INTEGER,
//    message_text TEXT,
//    sent_at TEXT,
//    FOREIGN KEY (user_id) REFERENCES Users(id)
//)`, (err) => {
//    if (err) {
//        console.error("Error creating Messages table:", err.message);
//    } else {
//        console.log("Messages table created or already exists.");
//    }
//});

//module.exports = db;
