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

db.query(`
  CREATE TABLE IF NOT EXISTS opportunities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    stipend DECIMAL(10,2) NOT NULL,
    location VARCHAR(255) NOT NULL,
    duration VARCHAR(255) NOT NULL,
    requirements TEXT NOT NULL,
    closing_date DATE NOT NULL
  )
`, (err) => {
  if (err) {
    console.log('Error creating table:', err.message);
  } else {
    console.log('Opportunities table ready');
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

app.post('/opportunities', (req, res) => {
  const { title, description, stipend, location, duration, requirements, closingDate } = req.body;

  if (!title || !description || !stipend || !location || !duration || !requirements || !closingDate) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (isNaN(stipend)) {
    return res.status(400).json({ error: 'Stipend must be a number' });
  }

  if (new Date(closingDate) < new Date()) {
    return res.status(400).json({ error: 'Closing date cannot be in the past' });
  }

  const query = 'INSERT INTO opportunities (title, description, stipend, location, duration, requirements, closing_date) VALUES (?, ?, ?, ?, ?, ?, ?)';
  
  db.query(query, [title, description, stipend, location, duration, requirements, closingDate], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to save opportunity' });
    }
    res.status(201).json({ message: 'Opportunity saved successfully' });
  });
});

module.exports = app;