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
// GET JOBS
// ======================
router.get("/jobs", (req, res) => {
  db.query("SELECT * FROM opportunities", (err, results) => {
    if (err) {
      console.error("JOBS ERROR:", err);
      return res.status(500).json({ error: err.message });
    }

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

// ======================
// GET CURRENT ADMIN
// ======================
router.get("/me", verifyToken, (req, res) => {
  const sql = `
    SELECT 
      u.email,
      u.role,
      p.name,
      p.surname
    FROM users u
    LEFT JOIN admin_profile p 
      ON u.email = p.email
    WHERE u.email = ?
  `;

  db.query(sql, [req.email], (err, results) => {
    if (err) {
      console.error("ERROR IN /admin/me:", err);
      return res.status(500).json({ error: err.message });
    }

    if (!results.length) {
      return res.status(404).json({ error: "Admin not found" });
    }

    res.json(results[0]);
  });
});

// ======================
// GET ALL ADMINS
// ======================
router.get("/admins", (req, res) => {
  db.query("SELECT * FROM admin_profile", (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// ======================
// ADD ADMIN 
// ======================
router.post("/admins", async (req, res) => {
  const { name, surname, email, password } = req.body;

  try {
    // Prevent duplicate in MySQL FIRST
    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, existing) => {
        if (existing.length > 0) {
          return res.status(400).json({
            error: "User already exists in database"
          });
        }

        // Create Firebase user
        const userRecord = await admin.auth().createUser({
          email,
          password,
        });

        const uid = userRecord.uid;

        // Insert into users
        db.query(
          "INSERT INTO users (firebase_uid, email, role) VALUES (?, ?, 'admin')",
          [uid, email],
          (err1) => {
            if (err1) {
              console.error(err1);
              return res.status(500).json({ error: "Users insert failed" });
            }

            // Insert into admin_profile
            db.query(
              "INSERT INTO admin_profile (firebase_uid, name, surname, email) VALUES (?, ?, ?, ?)",
              [uid, name, surname, email],
              (err2) => {
                if (err2) {
                  console.error(err2);
                  return res.status(500).json({ error: "Profile insert failed" });
                }

                res.json({
                  firebase_uid: uid,
                  name,
                  surname,
                  email,
                  role: "admin"
                });
              }
            );
          }
        );
      }
    );
  } catch (error) {
    console.error("Firebase create error:", error);

    if (error.code === "auth/email-already-in-use") {
      return res.status(400).json({
        error: "Email already exists in Firebase"
      });
    }

    return res.status(500).json({
      error: error.message,
    });
  }
});


// ======================
// DELETE ADMIN 
// ======================
router.delete("/admins/:firebase_uid", async (req, res) => {
  const firebase_uid = req.params.firebase_uid;

  try {
    // 1. Delete Firebase user 
    try {
      await admin.auth().deleteUser(firebase_uid);
    } catch (err) {
      if (err.code !== "auth/user-not-found") {
        throw err;
      }
    }

    // 2. Delete admin_profile 
    await new Promise((resolve, reject) => {
      db.query(
        "DELETE FROM admin_profile WHERE firebase_uid = ?",
        [firebase_uid],
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    });

    // 3. Delete users (PROMISE SAFE)
    await new Promise((resolve, reject) => {
      db.query(
        "DELETE FROM users WHERE firebase_uid = ?",
        [firebase_uid],
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    });

    res.json({ success: true });

  } catch (err) {
    console.error("DELETE FAILED:", err);
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;