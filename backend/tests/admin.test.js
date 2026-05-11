const request = require("supertest");
const app = require("../app");

// ======================
// MOCK FIREBASE
// ======================
jest.mock("firebase-admin", () => ({
  apps: [],
  initializeApp: jest.fn(),
  auth: () => ({
    createUser: jest.fn().mockResolvedValue({ uid: "fake-uid-123" }),
    deleteUser: jest.fn().mockResolvedValue(true),
    verifyIdToken: jest.fn().mockResolvedValue({
      uid: "fake-uid-123",
      email: "admin@test.com",
    }),
  }),
}));

// ======================
// MOCK DATABASE
// ======================
// Mock database
jest.mock("../db", () => ({
  query: jest.fn((sql, params, callback) => {
    if (typeof params === "function") {
      callback = params;
    }

    if (sql.includes("SELECT * FROM admin_profile")) {
      return callback(null, []);
    }

    if (sql.includes("SELECT * FROM users WHERE email")) {
      return callback(null, []);
    }

    if (sql.includes("SELECT * FROM users")) {
      return callback(null, []);
    }

    if (sql.includes("INSERT INTO users")) {
      return callback(null, {});
    }

    if (sql.includes("INSERT INTO admin_profile")) {
      return callback(null, {});
    }

    if (sql.includes("DELETE FROM admin_profile")) {
      return callback(null, {});
    }

    if (sql.includes("DELETE FROM users")) {
      return callback(null, {});
    }

    if (sql.includes("SELECT * FROM opportunities")) {
      return callback(null, []);
    }

    if (sql.includes("UPDATE opportunities")) {
      return callback(null, { affectedRows: 1 });
    }

    // Provider status UPDATE
    if (sql.includes("UPDATE provider_profile")) {
      return callback(null, { affectedRows: 1 });
    }

    // Provider lookup by id (for email after status update)
    if (sql.includes("SELECT email, contact_person, company_name")) {
      return callback(null, [{
        email: "provider@test.com",
        contact_person: "John",
        company_name: "Test Co",
      }]);
    }

    // Provider SELECT (GET all / GET by id)
    if (sql.includes("provider_profile")) {
      return callback(null, []);
    }

    // Broad fallback
    if (sql.includes("SELECT")) {
      return callback(null, []);
    }

    callback(null, []);
  }),
  end: jest.fn(),
}));

  // ======================
  // JOB APPROVAL / REJECTION
  // ======================
  test("GET /admin/jobs", async () => {
    const res = await request(app).get("/admin/jobs");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("PUT /admin/jobs/:id/status → approve job", async () => {
    const res = await request(app)
      .put("/admin/jobs/1/status")
      .send({ status: "approved" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Status updated");
  });

  test("PUT /admin/jobs/:id/status → reject job", async () => {
    const res = await request(app)
      .put("/admin/jobs/1/status")
      .send({ status: "rejected" });

    expect(res.statusCode).toBe(200);
  });


  // ======================
  // PROVIDER APPROVAL / REJECTION
  // ======================
  test("GET /provider-profile", async () => {
  const res = await request(app).get("/provider-profile");

  expect(res.statusCode).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
});

test("PUT /provider-profile/:id/status → approve provider", async () => {
  const res = await request(app)
    .put("/provider-profile/1/status")
    .send({ status: "approved" });

  expect(res.statusCode).toBe(200);
  expect(res.body.message).toBe("Status updated successfully");
});

test("PUT /provider-profile/:id/status → reject provider", async () => {
  const res = await request(app)
    .put("/provider-profile/1/status")
    .send({ status: "rejected" });

  expect(res.statusCode).toBe(200);
});
});

// Mock nodemailer so email sending never runs
jest.mock("nodemailer", () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: "fake-id" }),
  }),
}));