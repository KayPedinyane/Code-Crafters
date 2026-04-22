const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = require("../db");


// =========================
// VERIFY TOKEN 
// =========================
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split("Bearer ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  admin
    .auth()
    .verifyIdToken(token)
    .then((decoded) => {
      req.uid = decoded.uid;
      req.email = decoded.email;
      next();
    })
    .catch(() => {
      res.status(401).json({ error: "Invalid token" });
    });
}


// =========================
// LOGIN ROUTE
// =========================
router.post("/login", verifyToken, (req, res) => {
  const { uid, email } = req;

  const sql = `
    INSERT INTO users (firebase_uid, email, role)
    VALUES (?, ?, 'user')
    ON DUPLICATE KEY UPDATE firebase_uid = firebase_uid
  `;

  db.query(sql, [uid, email], (err) => {
    if (err) {
      console.error("LOGIN ERROR:", err);
      return res.status(500).json({ error: "DB error" });
    }

    db.query(
      "SELECT id, firebase_uid, email, role FROM users WHERE firebase_uid = ?",
      [uid],
      (err, rows) => {
        if (err) {
          console.error("FETCH ERROR:", err);
          return res.status(500).json({ error: "DB error" });
        }

       res.json({ role: rows[0].role, id: rows[0].id, email: rows[0].email });
      }
    );
  });
});

router.get('/user/:uid', (req, res) => {
  const sql = `
    SELECT 
      u.id,
      u.email,
      u.role,
      u.firebase_uid,
      pp.id AS provider_id,
      pp.company_name,
      pp.contact_person,
      pp.phone,
      pp.industry,
      pp.website,
      pp.address,
      pp.province
    FROM users u
    LEFT JOIN provider_profile pp ON u.email = pp.email
    WHERE u.firebase_uid = ?
  `;
  db.query(sql, [req.params.uid], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(results[0]);
  });
});

module.exports = router;