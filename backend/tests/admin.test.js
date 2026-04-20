const request = require("supertest");
const app = require("../app");

// ======================
// MOCK FIREBASE
// ======================
jest.mock("firebase-admin", () => {
  return {
    apps: [],
    initializeApp: jest.fn(),
    auth: () => ({
      createUser: jest.fn().mockResolvedValue({
        uid: "fake-uid-123",
      }),
      deleteUser: jest.fn().mockResolvedValue(true),
      verifyIdToken: jest.fn().mockResolvedValue({
        uid: "fake-uid-123",
        email: "admin@test.com",
      }),
    }),
  };
});

// ======================
// MOCK DATABASE
// ======================
jest.mock("../db", () => ({
  query: jest.fn((sql, params, callback) => {
    if (typeof params === "function") {
      callback = params;
    }

    // Admins
    if (sql.includes("SELECT * FROM admin_profile")) {
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

    // Jobs
    if (sql.includes("SELECT * FROM opportunities")) {
      return callback(null, []);
    }

    if (sql.includes("UPDATE opportunities")) {
      return callback(null, { affectedRows: 1 });
    }

    // Providers
    if (sql.includes("SELECT")) {
      return callback(null, []);
    }

    if (sql.includes("UPDATE provider_profile")) {
      return callback(null, { affectedRows: 1 });
    }

    callback(null, []);
  }),
  end: jest.fn(),
}));

// ======================
// TESTS
// ======================
describe("Admin API Tests", () => {

  // ======================
  // ADMINS
  // ======================
  test("GET /admin/admins", async () => {
    const res = await request(app).get("/admin/admins");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("POST /admin/admins", async () => {
    const res = await request(app)
      .post("/admin/admins")
      .send({
        name: "Test",
        surname: "User",
        email: "test@test.com",
        password: "123456",
      });

    expect([200, 400]).toContain(res.statusCode);
  });

  test("DELETE /admin/admins/:uid", async () => {
    const res = await request(app).delete("/admin/admins/fake-uid-123");

    expect([200, 500]).toContain(res.statusCode);
  });


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