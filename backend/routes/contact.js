const express = require('express');
const router  = express.Router();
const { sendEmail } = require('../utils/emailSender');

router.post('/', async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'Please fill in all required fields' });
  }

  try {
    await sendEmail({
      to: 'skillsbridgesa@gmail.com',
      subject: `[Help] ${subject} — from ${name}`,
      html: `
        <h2 style="color:#0a1628;">New Help Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr/>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });
    res.json({ message: 'Sent successfully' });
  } catch (err) {
    console.error('Contact email error:', err.message);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

module.exports = router;