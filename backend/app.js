const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send("API running");
});

module.exports = app;