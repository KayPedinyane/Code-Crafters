const express = require('express');
const router = express.Router();
const db = require('../db');

// Helper: create a notification
function createNotification(user_email, message, callback) {
  db.query(
    'INSERT INTO notifications (user_email, message) VALUES (?, ?)',
    [user_email, message],
    callback
  );
}

// POST /notifications - create a notification
router.post('/', (req, res) => {
  const { user_email, message } = req.body;

  if (!user_email || !message) {
    return res.status(400).json({ error: 'user_email and message are required' });
  }

  createNotification(user_email, message, (err) => {
    if (err) {
      console.error('DB error creating notification:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Notification created successfully' });
  });
});

// GET /notifications/:user_email - get all notifications for a user
router.get('/:user_email', (req, res) => {
  const sql = `
    SELECT * FROM notifications 
    WHERE user_email = ? 
    ORDER BY created_at DESC
  `;

  db.query(sql, [req.params.user_email], (err, results) => {
    if (err) {
      console.error('DB error fetching notifications:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// PATCH /notifications/:id/read - mark notification as read
router.patch('/:id/read', (req, res) => {
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
module.exports.createNotification = createNotification;