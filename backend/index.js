const app = require('./app');
const express = require('express');
const uploadRoute = require('./routes/upload');
console.log('uploadRoute:', uploadRoute)

app.use('/upload', uploadRoute);
app.use('/uploads', express.static('uploads'));

app.listen(5000, () => console.log("Server running on port 5000"));