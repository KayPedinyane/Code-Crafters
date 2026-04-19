const express = require('express');
const router = express.Router();
const db = require('../db');
const { createNotification } = require('./notifications');

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

      // Step 3: insert application with both applicant_id and applicant_email
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

          db.query(
                `SELECT u.email FROM users u 
                JOIN opportunities o ON o.provider_id = u.id 
                WHERE o.id = ?`,
                [opportunity_id],
                (err, providerRows) => {
                if (!err && providerRows.length > 0) {
                    createNotification(
                    providerRows[0].email,
                    `New application received for opportunity #${opportunity_id} from ${applicant_email}`,
                    () => {}
                    );
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

  // Step 1: get user id from email
  getUserIdByEmail(email, (err, applicant_id) => {
    if (err) {
      console.error('Error finding user:', err.message);
      return res.status(404).json({ error: err.message });
    }

    // Step 2: fetch applications joined with opportunities
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

// PATCH /applications/:id/status - update application status
router.patch('/:id/status', (req, res) => {
  const { status } = req.body;

  const allowed = ['pending', 'accepted', 'rejected'];
  if (!status || !allowed.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${allowed.join(', ')}` });
  }

  const sql = `UPDATE applications SET status = ? WHERE id = ?`;

  db.query(sql, [status, req.params.id], (err, result) => {
    if (err) {
      console.error('DB error updating application status:', err.message);
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Application not found' });

    // Notify applicant
    db.query('SELECT applicant_email FROM applications WHERE id = ?', [req.params.id], (err, rows) => {
      if (!err && rows.length > 0) {
        createNotification(
          rows[0].applicant_email,
          `Your application #${req.params.id} has been ${status}`,
          () => {}
        );
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