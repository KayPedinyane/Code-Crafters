// FirebaseTest.js
import React, { useEffect, useState } from "react";
import app from "./firebase";

export default function FirebaseTest() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    try {
      if (app) {
        setConnected(true); // Firebase initialized successfully
      }
    } catch (err) {
      console.error("Firebase connection failed:", err);
      setConnected(false);
    }
  }, []);

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      {connected ? (
        <h2 style={{ color: "green" }}>Firebase connected ✅</h2>
      ) : (
        <h2 style={{ color: "red" }}>Firebase connection failed ❌</h2>
      )}
    </div>
  );
}