const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /opportunities - provider posts a listing
router.post('/', (req, res) => {
  const {
    title,
    description,
    stipend,
    location,
    duration,
    requirements,
    closing_date,
    provider_id
  } = req.body;

  if (!title || !description || !location || !duration || !closing_date || !provider_id) {
    return res.status(400).json({ error: 'Please fill in all required fields' });
  }

  const sql = `INSERT INTO opportunities 
    (title, description, stipend, location, duration, requirements, closing_date, provider_id) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(sql, [title, description, stipend, location, duration, requirements, closing_date, provider_id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Opportunity posted successfully', id: result.insertId });
  });
});

// GET /opportunities - get all approved listings
router.get('/', (req, res) => {
  const sql = `SELECT * FROM opportunities WHERE status = 'approved'`;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// GET /opportunities/:id - get single listing
router.get('/:id', (req, res) => {
  const sql = `SELECT * FROM opportunities WHERE id = ?`;

  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Opportunity not found' });
    res.json(results[0]);
  });
});

// PATCH /opportunities/:id/approve - admin approves listing
router.patch('/:id/approve', (req, res) => {
  const sql = `UPDATE opportunities SET status = 'approved' WHERE id = ?`;

  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Opportunity not found' });
    res.json({ message: 'Opportunity approved successfully' });
  });
});

// DELETE /opportunities/:id - admin removes listing
router.delete('/:id', (req, res) => {
  const sql = `UPDATE opportunities SET status = 'removed' WHERE id = ?`;

  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Opportunity not found' });
    res.json({ message: 'Opportunity removed successfully' });
  });
});

module.exports = router;