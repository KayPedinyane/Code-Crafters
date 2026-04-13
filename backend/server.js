import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import fs from "fs";
import admin from "firebase-admin";

const serviceAccount = JSON.parse(
  fs.readFileSync("./serviceAccountKey.json", "utf8")
);

const app = express();

app.use(cors({
  origin: 3000,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "No authorization header" });
  }

  const token = authHeader.split("Bearer ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.uid = decoded.uid;
    next();
  } catch (err) {
    console.error("Token error:", err);
    return res.status(401).json({ error: "Invalid token" });
  }
}

async function startServer() {
  try {
    const db = await mysql.createConnection({
      host: "maglev.proxy.rlwy.net",
      user: "root",
      port: 10762,
      password: "JdMDnEZAYeKXogScoErdRuLrAndpzcXl",
      database: "railway"
    });

    console.log("Connected to MySQL");

    app.locals.db = db;

    app.get("/", (req, res) => {
      res.send("Backend is running");
    });

    app.post("/api/create", verifyToken, async (req, res) => {
      const db = req.app.locals.db;
      const uid = req.uid;
      const { email, role } = req.body;

      try {
        await db.query(
          "INSERT INTO `users` (firebase_uid, email, role) VALUES (?, ?, ?)",
          [uid, email, role]
        );

        res.json({ message: "User saved successfully" });
      } catch (err) {
        console.error("DB ERROR:", err.sqlMessage || err.message);
        return res.status(500).json({
          error: err.sqlMessage || err.message
        });
      }
    });

    app.post("/api/login", verifyToken, async (req, res) => {
      const db = req.app.locals.db;
      const uid = req.uid;

      try {
        const [rows] = await db.query(
          "SELECT role FROM `users` WHERE firebase_uid = ?",
          [uid]
        );

        if (rows.length === 0) {
          return res.status(404).json({ error: "User not found" });
        }

        res.json({ role: rows[0].role });

      } catch (err) {
        console.error("LOGIN ERROR:", err);
        res.status(500).json({ error: "Server error" });
      }
    });

    app.get("/admin", verifyToken, async (req, res) => {
      const db = req.app.locals.db;
      const uid = req.uid;

      try {
        const [rows] = await db.query(
          "SELECT role FROM `users` WHERE firebase_uid = ?",
          [uid]
        );

        if (rows.length === 0) {
          return res.status(404).json({ error: "User not found" });
        }

        if (rows[0].role !== "admin") {
          return res.status(403).json({ error: "Access denied" });
        }

        res.json({ message: "Welcome admin" });

      } catch (err) {
        console.error("ADMIN ERROR:", err);
        res.status(500).json({ error: "Server error" });
      }
    });

    app.listen(8080, () => {
      console.log("Server running on http://localhost:8080");
    });

  } catch (err) {
    console.error("Failed to start server:", err);
  }
}

startServer();