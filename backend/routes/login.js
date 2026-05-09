const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = require("../db");

function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  admin.auth().verifyIdToken(token)
    .then((decoded) => {
      req.uid = decoded.uid;
      req.email = decoded.email;
      next();
    })
    .catch((err) => {
      console.error("Token error:", err.message);
      if (!res.headersSent) res.status(401).json({ error: "Invalid token" });
    });
}

// LOGIN
router.post("/login", verifyToken, (req, res) => {
  const { uid } = req;
  console.log("LOGIN uid:", uid);

  db.query(
    "SELECT id, firebase_uid, email, role FROM users WHERE firebase_uid = ?",
    [uid],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "DB error" });
      console.log("LOGIN rows:", rows);
      if (!rows || rows.length === 0) return res.status(404).json({ error: "User not found" });
      res.json({ role: rows[0].role, id: rows[0].id, email: rows[0].email });
    }
  );
});

// CREATE
router.post("/create", verifyToken, (req, res) => {
  const { uid } = req;
  const email = req.email || req.body.email;
  const { role } = req.body;

  console.log("CREATE uid:", uid, "email:", email, "role:", role);

  if (!role) return res.status(400).json({ error: "Role is required" });
  if (!email) return res.status(400).json({ error: "Email is required" });

  db.query(
  `INSERT INTO users (firebase_uid, email, role) 
   VALUES (?, ?, ?) 
   ON DUPLICATE KEY UPDATE 
     firebase_uid = VALUES(firebase_uid),
     role = VALUES(role)`,
  [uid, email, role],
  (err) => {
    if (err) {
      console.error("CREATE ERROR:", err);
      return res.status(500).json({ error: "DB error" });
    }

    console.log("User created successfully");

    db.query(
      "SELECT id, firebase_uid, email, role FROM users WHERE firebase_uid = ?",
      [uid],
      (err, rows) => {
        if (err) return res.status(500).json({ error: "DB error" });
        console.log("Created user:", rows[0]);
        res.json(rows[0]);
      }
    );
  }
);
});

// DELETE USER
router.delete("/user/:uid", decodeTokenLocally, (req, res) => {
  const uid = req.params.uid;

  db.query("SELECT * FROM users WHERE firebase_uid = ?", [uid], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (rows.length === 0) return res.status(404).json({ error: "User not found" });

    db.query("DELETE FROM users WHERE firebase_uid = ?", [uid], (err) => {
      if (err) return res.status(500).json({ error: err.message });

      admin.auth().deleteUser(uid)
        .then(() => res.json({ message: "User deleted successfully" }))
        .catch((err) => {
          console.error("Firebase delete error:", err.message);
          res.json({ message: "User deleted from database" });
        });
    });
  });
});

function decodeTokenLocally(req, res, next) {
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const base64Payload = token.split(".")[1];
    const padding = base64Payload.length % 4;
    const padded = padding ? base64Payload + "=".repeat(4 - padding) : base64Payload;
    const payload = JSON.parse(Buffer.from(padded, "base64").toString("utf8"));

    console.log("Decoded token payload:", JSON.stringify(payload)); // 👈 see everything

    req.uid = payload.user_id || payload.sub || payload.uid;
    req.email = payload.email || payload.firebase?.identities?.email?.[0];

    console.log("uid:", req.uid, "email:", req.email);

    if (!req.uid) return res.status(401).json({ error: "Could not extract UID from token" });

    next();
  } catch (err) {
    console.error("Token decode error:", err.message);
    return res.status(401).json({ error: "Invalid token format" });
  }
}

module.exports = router;