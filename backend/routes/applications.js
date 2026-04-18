const express = require('express');
const router = express.Router();
const db = require('../db');

// Helper: get user id from email
function getUserIdByEmail(email, callback) {
  db.query('SELECT id FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return callback(err, null);
    if (results.length === 0) return callback(new Error('User not found'), null);
    callback(null, results[0].id);
  });
}

// POST /applications - save new application
router.post('/', (req, res) => {
  const { applicant_email, opportunity_id } = req.body;

  if (!applicant_email || !opportunity_id) {
    return res.status(400).json({ error: 'applicant_email and opportunity_id are required' });
  }

  // Step 1: get user id from email
  getUserIdByEmail(applicant_email, (err, applicant_id) => {
    if (err) {
      console.error('Error finding user:', err.message);
      return res.status(404).json({ error: err.message });
    }

    // Step 2: check for duplicate
    const checkSql = `
      SELECT * FROM applications 
      WHERE applicant_id = ? AND opportunity_id = ?
    `;

    db.query(checkSql, [applicant_id, opportunity_id], (err, results) => {
      if (err) {
        console.error('DB error checking application:', err.message);
        return res.status(500).json({ error: err.message });
      }

      if (results.length > 0) {
        return res.status(409).json({ message: 'Already applied' });
      }

      // Step 3: insert application
      const insertSql = `
        INSERT INTO applications (applicant_id, opportunity_id)
        VALUES (?, ?)
      `;

      db.query(insertSql, [applicant_id, opportunity_id], (err, result) => {
        if (err) {
          console.error('DB error saving application:', err.message);
          return res.status(500).json({ error: err.message });
        }

        // Step 4: return saved application
        db.query('SELECT * FROM applications WHERE id = ?', [result.insertId], (err, rows) => {
          if (err) return res.status(500).json({ error: err.message });
          res.status(201).json(rows[0]);
        });
      });
    });
  });
});

// GET /applications/:email - get all applications for a user
router.get('/:email', (req, res) => {

  // Step 1: get user id from email
  getUserIdByEmail(req.params.email, (err, applicant_id) => {
    if (err) {
      console.error('Error finding user:', err.message);
      return res.status(404).json({ error: err.message });
    }

    // Step 2: fetch applications joined with opportunities
    const sql = `
      SELECT 
        a.id,
        a.applicant_id,
        a.opportunity_id,
        a.status,
        a.applied_at,
        o.title,
        o.sector,
        o.location,
        o.stipend,
        o.duration,
        o.nqf_level,
        o.closing_date,
        o.type
      FROM applications a
      JOIN opportunities o ON a.opportunity_id = o.id
      WHERE a.applicant_id = ?
      ORDER BY a.applied_at DESC
    `;

    db.query(sql, [applicant_id], (err, results) => {
      if (err) {
        console.error('DB error fetching applications:', err.message);
        return res.status(500).json({ error: err.message });
      }
      res.json(results);
    });
  });
});

module.exports = router;