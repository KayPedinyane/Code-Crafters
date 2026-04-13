require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: ['https://code-crafters-beige.vercel.app', 'http://localhost:3000']
}));

app.use(express.json());

const opportunitiesRouter = require('./routes/opportunities');

app.get('/', (req, res) => {
  res.send('API running');
});

app.get('/health', (req, res) => {
  const db = require('./db');
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