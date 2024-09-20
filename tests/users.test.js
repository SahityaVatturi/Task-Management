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
  // Get User Profile
  it("should get the profile of the logged-in user", async () => {
    const loginRes = await request(app).post("/api/auth/login").send({
      email: "testuser2@example.com",
      password: "Test@1234",
    });

    const res = await request(app).get("/api/auth/profile").set("Authorization", `Bearer ${loginRes.body.token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.email).toBe("testuser2@example.com");
  });

  // Update User Profile
  it("should update the profile of the logged-in user", async () => {
    const loginRes = await request(app).post("/api/auth/login").send({
      email: "testuser2@example.com",
      password: "Test@1234",
    });

    const res = await request(app).put("/api/auth/profile").set("Authorization", `Bearer ${loginRes.body.token}`).send({ name: "New Name" });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.name).toBe("New Name");
  });
});
