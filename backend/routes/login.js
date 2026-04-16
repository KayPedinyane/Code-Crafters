require('dotenv').config();
const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = require('../db');

// Middleware to verify Firebase token
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });

  admin.auth().verifyIdToken(token)
    .then(decoded => {
      req.uid = decoded.uid;
      req.email = decoded.email;
      next();
    })
    .catch(() => res.status(401).json({ error: 'Invalid token' }));
}

// POST /api/create
router.post('/create', verifyToken, (req, res) => {
  const { uid, email } = req;
  const { role } = req.body;

  const query = `
    INSERT INTO users (firebase_uid, email, role) 
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE email = email
  `;

  db.query(query, [uid, email, role], (err) => {
    if (err) {
      console.error('DB insert error:', err.message);
      return res.status(500).json({ error: 'DB error' });
    }
    res.json({ message: 'User saved successfully' });
  });
});

// POST /api/login
router.post('/', verifyToken, (req, res) => {
  const { uid, email } = req;

  // Insert user if they don't exist, otherwise ignore
  const upsertQuery = `
    INSERT INTO users (firebase_uid, email, role) 
    VALUES (?, ?, 'user') 
    ON DUPLICATE KEY UPDATE firebase_uid = firebase_uid
  `;

  db.query(upsertQuery, [uid, email], (err) => {
    if (err) {
      console.error('DB upsert error:', err.message);
      return res.status(500).json({ error: 'DB error' });
    }

    // Now fetch their role
    db.query('SELECT role FROM users WHERE firebase_uid = ?', [uid], (err, rows) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      if (rows.length === 0) return res.status(404).json({ error: 'User not found' });

      res.json({ role: rows[0].role });
    });
  });
});

module.exports = router;
module.exports.verifyToken = verifyToken;
