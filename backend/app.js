require('dotenv').config()
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();

app.use(cors({
  origin: 'https://code-crafters-beige.vercel.app'
}));

app.use(express.json());

const db = mysql.createConnection({
  host: process.env.MYSQLHOST,
  port: process.env.MYSQLPORT,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE
});

db.connect((err) => {
  if (err) {
    console.log('MySQL connection error:', err.message);
  } else {
    console.log('Connected to MySQL');
  }
});

app.get('/', (req, res) => {
    res.send("API running");
});

app.get('/health', (req, res) => {
  db.query('SELECT 1', (err) => {
    if (err) {
      res.json({ api: 'running', database: 'disconnected' });
    } else {
      res.json({ api: 'running', database: 'connected' });
    }
  });
});

module.exports = app;