const express = require('express');
const router = express.Router();
const db = require('../db');
const { createNotification } = require('./notifications');
const { sendStatusEmail } = require('../utils/emailSender');


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
        INSERT INTO applications (applicant_email, applicant_id, opportunity_id)
        VALUES (?, ?, ?)
      `;

      db.query(insertSql, [applicant_email, applicant_id, opportunity_id], (err, result) => {
        if (err) {
          console.error('DB error saving application:', err.message);
          return res.status(500).json({ error: err.message });
        }

        // Step 4: return saved application
        db.query('SELECT * FROM applications WHERE id = ?', [result.insertId], (err, rows) => {
          if (err) return res.status(500).json({ error: err.message });

          // Notify + email provider
          db.query(
            `SELECT u.email, o.title FROM users u 
            JOIN opportunities o ON o.provider_id = u.id 
            WHERE o.id = ?`,
            [opportunity_id],
            (err, providerRows) => {
              if (!err && providerRows.length > 0) {
                const { email: providerEmail, title } = providerRows[0];

                // In-app notification
                createNotification(
                  providerEmail,
                  `New application received for "${title}" from ${applicant_email}`,
                  () => {}
                );

                // Email to provider
                sendStatusEmail(providerEmail, applicant_email, title, 'new_application')
                  .then(() => console.log(`New application email sent to provider ${providerEmail}`))
                  .catch(err => console.error('Provider email error:', err.message));
              }
            }
          );

          res.status(201).json(rows[0]);
        });
      });
    });
  });
});

// GET /applications/:email - get all applications for a user
router.get('/:email', (req, res) => {
  const email = decodeURIComponent(req.params.email);

  getUserIdByEmail(email, (err, applicant_id) => {
    if (err) {
      console.error('Error finding user:', err.message);
      return res.status(404).json({ error: err.message });
    }

    const sql = `
      SELECT 
        a.id,
        a.applicant_id,
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
        o.closing_date
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

// GET /applications/opportunities/:id - get all applications for an opportunity
router.get('/opportunities/:id', (req, res) => {
  const sql = `
    SELECT 
      a.id,
      a.applicant_id,
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
      o.closing_date
    FROM applications a
    JOIN opportunities o ON a.opportunity_id = o.id
    WHERE a.opportunity_id = ?
    ORDER BY a.applied_at DESC
  `;

  db.query(sql, [req.params.id], (err, results) => {
    if (err) {
      console.error('DB error fetching applications for opportunity:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// PATCH /applications/:id/status
router.patch('/:id/status', (req, res) => {
  const { status } = req.body;

  const allowed = ['pending', 'accepted', 'rejected', 'shortlisted'];
  if (!status || !allowed.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${allowed.join(', ')}` });
  }

  const sql = `UPDATE applications SET status = ? WHERE id = ?`;

  db.query(sql, [status, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Application not found' });

    // Get applicant details and opportunity title for email
    db.query(`
      SELECT a.applicant_email, p.full_name, o.title
      FROM applications a
      LEFT JOIN profile p ON p.email = a.applicant_email
      LEFT JOIN opportunities o ON o.id = a.opportunity_id
      WHERE a.id = ?
    `, [req.params.id], (err, rows) => {
      if (!err && rows.length > 0) {
        const { applicant_email, full_name, title } = rows[0];

        // In-app notification
        createNotification(
          applicant_email,
          `Your application for "${title}" has been ${status}.`,
          () => {}
        );

        // Email to applicant
        sendStatusEmail(applicant_email, full_name, title, status)
          .then(() => console.log(`Status email sent to ${applicant_email} [${status}]`))
          .catch(err => console.error('Email send error:', err.message));
      }
    });

    res.json({ message: 'Application status updated successfully' });
  });
});

// PUT /notifications/:id/read - mark notification as read
router.put('/:id/read', (req, res) => {
  const sql = `UPDATE notifications SET is_read = true WHERE id = ?`;

  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      console.error('DB error marking notification as read:', err.message);
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Notification not found' });
    res.json({ message: 'Notification marked as read' });
  });
});

module.exports = router;