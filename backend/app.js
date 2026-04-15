require('dotenv').config();
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const express = require('express');
const cors = require('cors');
const app = express();
const loginRouter = require('./routes/login');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    // Allow all vercel.app domains and localhost
    if (
      origin.endsWith('.vercel.app') ||
      origin === 'http://localhost:3000'
    ) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Explicitly handle preflight requests
app.options('*', cors());

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