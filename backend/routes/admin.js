const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /admin/jobs - get all jobs
router.get('/jobs', (req, res) => {
  const sql = `SELECT * FROM opportunities`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// GET /admin/jobs/:jobId - get single job
router.get('/jobs/:jobId', (req, res) => {
  const sql = `SELECT * FROM opportunities WHERE id = ?`;
  db.query(sql, [req.params.jobId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Job not found' });
    res.json(results[0]);
  });
});

// PUT /admin/jobs/:jobId/status - approve or reject job
router.put('/jobs/:jobId/status', (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required' });

  const sql = `UPDATE opportunities SET status = ? WHERE id = ?`;
  db.query(sql, [status, req.params.jobId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Job not found' });
    res.json({ message: `Job ${status} successfully` });
  });
});

module.exports = router;