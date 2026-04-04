const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({
  origin: 'https://code-crafters-beige.vercel.app'
}));

app.get('/', (req, res) => {
    res.send("API running");
});

module.exports = app;