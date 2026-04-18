const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /provider-profile - save or update provider profile
router.post('/', (req, res) => {
  const {
    email, company_name, contact_person, phone,
    industry, website, address, province
  } = req.body;

  if (!email) return res.status(400).json({ error: 'Email is required' });

  const sql = `
    INSERT INTO provider_profile (
      email, company_name, contact_person, phone,
      industry, website, address, province
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      company_name = VALUES(company_name),
      contact_person = VALUES(contact_person),
      phone = VALUES(phone),
      industry = VALUES(industry),
      website = VALUES(website),
      address = VALUES(address),
      province = VALUES(province)
  `;

  const values = [
    email, company_name, contact_person, phone,
    industry, website, address, province
  ];

  db.query(sql, values, (err) => {
    if (err) {
      console.error('DB error saving provider profile:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Provider profile saved successfully' });
  });
});

// GET /provider-profile/:email - get provider profile by email
router.get('/:email', (req, res) => {
  const sql = `SELECT * FROM provider_profile WHERE email = ?`;

  db.query(sql, [req.params.email], (err, results) => {
    if (err) {
      console.error('DB error fetching provider profile:', err.message);
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) return res.status(404).json({ error: 'Provider profile not found' });
    res.json(results[0]);
  });
});

// PATCH /provider-profile/:email/accept - admin accepts provider
router.patch('/:email/accept', (req, res) => {
  const sql = `UPDATE provider_profile SET status = 'accepted' WHERE email = ?`;

  db.query(sql, [req.params.email], (err, result) => {
    if (err) {
      console.error('DB error accepting provider:', err.message);
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Provider not found' });
    res.json({ message: 'Provider accepted successfully' });
  });
});

// PATCH /provider-profile/:email/reject - admin rejects provider
router.patch('/:email/reject', (req, res) => {
  const sql = `UPDATE provider_profile SET status = 'rejected' WHERE email = ?`;

  db.query(sql, [req.params.email], (err, result) => {
    if (err) {
      console.error('DB error rejecting provider:', err.message);
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Provider not found' });
    res.json({ message: 'Provider rejected successfully' });
  });
});

// GET /provider-profile - get all providers (admin view)
router.get('/', (req, res) => {
  const sql = `SELECT * FROM provider_profile`;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('DB error fetching providers:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

module.exports = router;