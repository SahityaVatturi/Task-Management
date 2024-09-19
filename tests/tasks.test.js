const mongoose = require("mongoose");
const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../index");

let mongoServer;
let token;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Register and login a user to get a valid token for the task tests
  await request(app).post("/api/auth/register").send({
    email: "testuser@example.com",
    password: "Test@1234",
  });

  const loginRes = await request(app).post("/api/auth/login").send({
    email: "testuser@example.com",
    password: "Test@1234",
  });

  token = loginRes.body.token; // Store token for authenticated requests
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Task API Tests", () => {
  // Create Task
  it("should create a new task for an authenticated user", async () => {
    const res = await request(app).post("/api/tasks").set("Authorization", `Bearer ${token}`).send({
      title: "New Task",
      description: "Task description",
      //   dueDate: "2024-12-31",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("title", "New Task");
  });

  it("should not create a task with missing fields", async () => {
    const res = await request(app).post("/api/tasks").set("Authorization", `Bearer ${token}`).send({
      description: "Task description without a title",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  // Get All Tasks
  it("should fetch all tasks for the authenticated user", async () => {
    const res = await request(app).get("/api/tasks").set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Update Task
  it("should update an existing task for the authenticated user", async () => {
    // Create a task first
    const createRes = await request(app).post("/api/tasks").set("Authorization", `Bearer ${token}`).send({
      title: "Update Task",
      description: "Task description",
      //   dueDate: "2024-12-31",
    });

    const taskId = createRes.body._id;

    // Update the task
    const res = await request(app).put(`/api/tasks/${taskId}`).set("Authorization", `Bearer ${token}`).send({
      title: "Updated Task Title",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("title", "Updated Task Title");
  });

  it("should not update another user's task", async () => {
    // Create a second user
    await request(app).post("/api/auth/register").send({
      email: "otheruser@example.com",
      password: "Test@1234",
    });

    const otherLoginRes = await request(app).post("/api/auth/login").send({
      email: "otheruser@example.com",
      password: "Test@1234",
    });

    const otherToken = otherLoginRes.body.token;

    // Attempt to update the first user's task with the second user's token
    const res = await request(app).put(`/api/tasks/${taskId}`).set("Authorization", `Bearer ${otherToken}`).send({
      title: "Malicious Update Attempt",
    });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe("Access denied");
  });

  // Delete Task
  it("should delete a task for the authenticated user", async () => {
    // Create a task first
    const createRes = await request(app).post("/api/tasks").set("Authorization", `Bearer ${token}`).send({
      title: "Delete Task",
      description: "Task description",
      //   dueDate: "2024-12-31",
    });

    const taskId = createRes.body._id;

    // Delete the task
    const res = await request(app).delete(`/api/tasks/${taskId}`).set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Task deleted successfully");
  });

  it("should not delete another user's task", async () => {
    // Create another task with the second user's token
    const createRes = await request(app).post("/api/tasks").set("Authorization", `Bearer ${otherToken}`).send({
      title: "Other User's Task",
      description: "Task description",
      //   dueDate: "2024-12-31",
    });

    const otherTaskId = createRes.body._id;

    // Attempt to delete the second user's task with the first user's token
    const res = await request(app).delete(`/api/tasks/${otherTaskId}`).set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe("Access denied");
  });
});
