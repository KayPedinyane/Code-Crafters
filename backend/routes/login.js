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
      "SELECT firebase_uid, email, role FROM users WHERE firebase_uid = ?",
      [uid],
      (err, rows) => {
        if (err) {
          console.error("FETCH ERROR:", err);
          return res.status(500).json({ error: "DB error" });
        }

        res.json(rows[0]);
      }
    );
  });
});

module.exports = router;