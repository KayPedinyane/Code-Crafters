require('dotenv').config();
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const app = express();
const loginRouter = require('./routes/login');

// const serviceAccount = require('./serviceAccountKey.json');

// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
//   });
// }


if (!admin.apps.length) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // CI / production — key stored as environment variable
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
    });
  } else {
    // Local development — key stored as a file
    const serviceAccount = require('./serviceAccountKey.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
}
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      'https://code-crafters-beige.vercel.app',
      'http://localhost:3000'
    ];
    if (!origin || allowed.includes(origin) || origin.endsWith('kaypedinyanes-projects.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(express.json());

const opportunitiesRouter = require('./routes/opportunities');
const adminRouter = require('./routes/admin');

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
app.use('/admin', adminRouter);
app.use('/api/login', loginRouter);

module.exports = app;