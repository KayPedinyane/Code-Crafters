const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = require("../db");


// ======================
// AUTH MIDDLEWARE
// ======================
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split("Bearer ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token" });
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


// ======================
// GET ADMIN PROFILE
// ======================
router.get("/me", verifyToken, (req, res) => {
  const sql = `
    SELECT 
      u.email,
      u.role,
      p.name,
      p.surname,
      p.username
    FROM users u
    LEFT JOIN admin_profile p 
      ON u.firebase_uid = p.firebase_uid
    WHERE u.firebase_uid = ?
  `;

  db.query(sql, [req.uid], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (!results.length) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = results[0];

    res.json({
      name: `${user.name || ""} ${user.surname || ""}`.trim() || user.username,
      email: user.email,
      role: user.role,
    });
  });
});


// ======================
// GET ADMINS LIST
// ======================
router.get("/admins", (req, res) => {
  const sql = `
    SELECT 
      u.firebase_uid,
      u.email,
      u.role,
      p.name,
      p.surname,
      p.username
    FROM users u
    LEFT JOIN admin_profile p 
      ON u.firebase_uid = p.firebase_uid
    WHERE u.role = 'admin'
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json(results);
  });
});


// ======================
// GET JOBS
// ======================
router.get("/jobs", (req, res) => {
  db.query("SELECT * FROM opportunities", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json(results);
  });
});


// ======================
// GET SINGLE JOB
// ======================
router.get("/jobs/:jobId", (req, res) => {
  db.query(
    "SELECT * FROM opportunities WHERE id = ?",
    [req.params.jobId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      if (!results.length) {
        return res.status(404).json({ error: "Job not found" });
      }

      res.json(results[0]);
    }
  );
});


// ======================
// UPDATE JOB STATUS
// ======================
router.put("/jobs/:jobId/status", (req, res) => {
  const { status } = req.body;

  db.query(
    "UPDATE opportunities SET status = ? WHERE id = ?",
    [status, req.params.jobId],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Job not found" });
      }

      res.json({ message: "Status updated" });
    }
  );
});

module.exports = router;