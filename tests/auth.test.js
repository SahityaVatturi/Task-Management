const mongoose = require("mongoose");
const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../index");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Auth API Tests", () => {
  // User Registration
  it("should register a new user with valid data", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "testuser@example.com",
      password: "Test@1234",
    });

    expect(res.statusCode).toBe(201);
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
    expect(res.body.message).toBe("Successfully logged out");
  });

  // Refresh Token
  it("should refresh a token", async () => {
    const loginRes = await request(app).post("/api/auth/login").send({
      email: "testuser2@example.com",
      password: "Test@1234",
    });

    const res = await request(app).post("/api/auth/refresh-token").send({ refreshToken: loginRes.body.refreshToken });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  // Forgot Password
  it("should send a forgot password email", async () => {
    const res = await request(app).post("/api/auth/forgot-password").send({
      email: "testuser2@example.com",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Password reset link sent to your email.");
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
    expect(res.body.message).toBe("Password reset successful");
  });

  // Get User Profile
  it("should get the profile of the logged-in user", async () => {
    const loginRes = await request(app).post("/api/auth/login").send({
      email: "testuser2@example.com",
      password: "Test@1234",
    });

    const res = await request(app).get("/api/auth/profile").set("Authorization", `Bearer ${loginRes.body.token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe("testuser2@example.com");
  });

  // Update User Profile
  it("should update the profile of the logged-in user", async () => {
    const loginRes = await request(app).post("/api/auth/login").send({
      email: "testuser2@example.com",
      password: "Test@1234",
    });

    const res = await request(app).put("/api/auth/profile").set("Authorization", `Bearer ${loginRes.body.token}`).send({ name: "New Name" });

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe("New Name");
  });
});
