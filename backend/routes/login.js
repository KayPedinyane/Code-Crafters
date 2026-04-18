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
router.post('/login', verifyToken, (req, res) => {
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

    // Now fetch their role, id and email
    db.query('SELECT role, id, email FROM users WHERE firebase_uid = ?', [uid], (err, rows) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      if (rows.length === 0) return res.status(404).json({ error: 'User not found' });

      res.json({
        role: rows[0].role,
        id: rows[0].id,
        email: rows[0].email
      });
    });
  });
});

// GET /api/user/:uid - get user by Firebase UID
router.get('/user/:uid', (req, res) => {
  const sql = `
    SELECT 
      u.id,
      u.email,
      u.role,
      u.firebase_uid,
      pp.id AS provider_id,
      pp.company_name,
      pp.contact_person,
      pp.phone,
      pp.industry,
      pp.website,
      pp.address,
      pp.province,
      pp.status AS provider_status
    FROM users u
    LEFT JOIN provider_profile pp ON u.email = pp.email
    WHERE u.firebase_uid = ?
  `;

  db.query(sql, [req.params.uid], (err, results) => {
    if (err) {
      console.error('DB error fetching user:', err.message);
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(results[0]);
  });
});

module.exports = router;
module.exports.verifyToken = verifyToken;
