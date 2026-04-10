require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const opportunitiesRouter = require('./routes/opportunities');

const app = express();

app.use(cors({
  origin: 'https://code-crafters-beige.vercel.app'
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API running');
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

app.use('/opportunities', opportunitiesRouter);

module.exports = app;