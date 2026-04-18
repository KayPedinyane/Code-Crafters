const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /admin-profile - save or update admin profile
router.post('/', (req, res) => {
  const { email, name, surname } = req.body;

  if (!email) return res.status(400).json({ error: 'Email is required' });

  const sql = `
    INSERT INTO admin_profile (email, name, surname)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      surname = VALUES(surname)
  `;

  db.query(sql, [email, name, surname], (err) => {
    if (err) {
      console.error('DB error saving admin profile:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Admin profile saved successfully' });
  });
});

// GET /admin-profile/:email - get admin profile by email
router.get('/:email', (req, res) => {
  const sql = `SELECT * FROM admin_profile WHERE email = ?`;

  db.query(sql, [req.params.email], (err, results) => {
    if (err) {
      console.error('DB error fetching admin profile:', err.message);
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) return res.status(404).json({ error: 'Admin profile not found' });
    res.json(results[0]);
  });
});

module.exports = router;