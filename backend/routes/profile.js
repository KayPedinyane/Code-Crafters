const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /profile - save or update profile
router.post('/', (req, res) => {
  const {
    email, full_name, phone, id_number, date_of_birth,
    gender, race, disability, city, province,
    qualification, institution, year_completed, nqf_level,
    subjects, skills, cv_url
  } = req.body;

  if (!email) return res.status(400).json({ error: 'Email is required' });

  const sql = `
    INSERT INTO profile (
      email, full_name, phone, id_number, date_of_birth,
      gender, race, disability, city, province,
      qualification, institution, year_completed, nqf_level,
      subjects, skills, cv_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      full_name = VALUES(full_name),
      phone = VALUES(phone),
      id_number = VALUES(id_number),
      date_of_birth = VALUES(date_of_birth),
      gender = VALUES(gender),
      race = VALUES(race),
      disability = VALUES(disability),
      city = VALUES(city),
      province = VALUES(province),
      qualification = VALUES(qualification),
      institution = VALUES(institution),
      year_completed = VALUES(year_completed),
      nqf_level = VALUES(nqf_level),
      subjects = VALUES(subjects),
      skills = VALUES(skills),
      cv_url = VALUES(cv_url)
  `;

  const values = [
    email, full_name, phone, id_number, date_of_birth,
    gender, race, disability, city, province,
    qualification, institution, year_completed, nqf_level,
    subjects, skills, cv_url
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('DB error saving profile:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Profile saved successfully' });
  });
});

// GET /profile/:email - get profile by email
router.get('/:email', (req, res) => {
  const sql = `SELECT * FROM profile WHERE email = ?`;

  db.query(sql, [req.params.email], (err, results) => {
    if (err) {
      console.error('DB error fetching profile:', err.message);
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) return res.status(404).json({ error: 'Profile not found' });
    res.json(results[0]);
  });
});

module.exports = router;