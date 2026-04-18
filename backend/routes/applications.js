const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /applications - save new application
router.post('/', (req, res) => {
  const { applicant_email, opportunity_id } = req.body;

  if (!applicant_email || !opportunity_id) {
    return res.status(400).json({ error: 'applicant_email and opportunity_id are required' });
  }

  // Check if already applied
  const checkSql = `
    SELECT * FROM applications 
    WHERE applicant_email = ? AND opportunity_id = ?
  `;

  db.query(checkSql, [applicant_email, opportunity_id], (err, results) => {
    if (err) {
      console.error('DB error checking application:', err.message);
      return res.status(500).json({ error: err.message });
    }

    if (results.length > 0) {
      return res.status(409).json({ error: 'You have already applied for this opportunity' });
    }

    // Insert new application
    const insertSql = `
      INSERT INTO applications (applicant_email, opportunity_id)
      VALUES (?, ?)
    `;

    db.query(insertSql, [applicant_email, opportunity_id], (err, result) => {
      if (err) {
        console.error('DB error saving application:', err.message);
        return res.status(500).json({ error: err.message });
      }

      // Return the saved application
      const fetchSql = `SELECT * FROM applications WHERE id = ?`;
      db.query(fetchSql, [result.insertId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json(rows[0]);
      });
    });
  });
});

// GET /applications/:email - get all applications for a user
router.get('/:email', (req, res) => {
  const sql = `
    SELECT 
      a.id,
      a.applicant_email,
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
    WHERE a.applicant_email = ?
    ORDER BY a.applied_at DESC
  `;

  db.query(sql, [req.params.email], (err, results) => {
    if (err) {
      console.error('DB error fetching applications:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

module.exports = router;