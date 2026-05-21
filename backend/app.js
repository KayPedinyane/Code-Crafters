require('dotenv').config();
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const app = express();

if (!admin.apps.length && process.env.NODE_ENV !== 'test') {
  try {
    const credential = process.env.FIREBASE_SERVICE_ACCOUNT
      ? admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
      : admin.credential.cert(require('./serviceAccountKey.json'));
    admin.initializeApp({ credential });
    console.log('Firebase initialized successfully');
  } catch (err) {
    console.error('Failed to initialize Firebase:', err.message);
    process.exit(1);
  }
}

app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      'https://code-crafters-beige.vercel.app',
      'http://localhost:3000'
    ];
    if (!origin || allowed.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,                                        
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],    
  allowedHeaders: ['Content-Type', 'Authorization'],        
}));

app.options(/.*/, cors());

app.use(express.json());

const loginRouter = require('./routes/login');
const profileRouter = require('./routes/profile');
const adminProfileRouter = require('./routes/admin_profile');
const providerProfileRouter = require('./routes/provider_profile');
const applicationsRouter = require('./routes/applications');
const notificationsRouter = require('./routes/notifications');
const opportunitiesRouter = require('./routes/opportunities');
const adminRouter = require('./routes/admin');
const nqfRouter = require('./routes/nqf');
const analyticsRouter = require("./routes/analytics");

app.get('/', (req, res) => res.send('API running'));

app.get('/health', (req, res) => {
  const db = require('./db');
  db.query('SELECT 1', (err) => {
    if (err) res.json({ api: 'running', database: 'disconnected' });
    else res.json({ api: 'running', database: 'connected' });
  });
});

app.use('/opportunities', opportunitiesRouter);
app.use('/admin', adminRouter);
app.use('/api', loginRouter);
app.use('/profile', profileRouter);
app.use('/admin-profile', adminProfileRouter);
app.use('/provider-profile', providerProfileRouter);
app.use('/applications', applicationsRouter);
app.use('/notifications', notificationsRouter);
app.use('/nqf', nqfRouter);
app.use('/api/analytics', analyticsRouter);

module.exports = app;