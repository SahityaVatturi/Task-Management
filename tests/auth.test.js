const mongoose = require("mongoose");
const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
require("dotenv").config({ path: ".env.test" });
const app = require("../index");

let mongoServer;

beforeAll(async () => {
  await mongoose.connection.close();
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  server = app.listen(process.env.PORT, () => {
    console.log(`Test server running on port ${process.env.PORT}`);
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Auth API Tests", () => {
  // User Registration
  it("should register a new user with valid data", async () => {
    const res = await request(app).post("/api/auth/register").send({
      firstName: "Test",
      lastName: "Test",
      email: "testuser@example.com",
      password: "Test@12345",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("message", "User registered successfully");
    expect(res.body).toHaveProperty("token");
  });

  it("should not register user with missing fields", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "",
      password: "Test@1234",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  // User Login
  it("should login a user with valid credentials", async () => {
    await request(app).post("/api/auth/register").send({
      email: "testuser2@example.com",
      password: "Test@1234",
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "testuser2@example.com",
      password: "Test@1234",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.message).toBe("User logged in successfully");
  });

  it("should not login with incorrect credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "wronguser@example.com",
      password: "WrongPassword",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Invalid credentials");
  });

  // Logout
  it("should successfully log out a user", async () => {
    const loginRes = await request(app).post("/api/auth/login").send({
      email: "testuser2@example.com",
      password: "Test@1234",
    });

    const res = await request(app).post("/api/auth/logout").set("Authorization", `Bearer ${loginRes.body.token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("User logged out successfully");
  });

  // Forgot Password
  it("should send a forgot password email", async () => {
    const res = await request(app).post("/api/auth/forgot-password").send({
      email: "testuser2@example.com",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.message).toBe("Token generated successfully");
  });

  // Reset Password
  it("should reset the user password with valid token", async () => {
    // Simulate forgot password
    await request(app).post("/api/auth/forgot-password").send({
      email: "testuser2@example.com",
    });

    // Simulating token for reset password (replace with actual token logic)
    const resetToken = "validResetToken"; // Assume this is retrieved from your DB or email
    const res = await request(app).post("/api/auth/reset-password").send({
      token: resetToken,
      newPassword: "NewPassword@123",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Password reset successfully");
  });
});
