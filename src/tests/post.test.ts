import request from "supertest";
import { Express } from "express";
import mongoose from "mongoose";
import initApp from "../app";
import { User, Post } from "../models/models";

const generateObjectId = () => new mongoose.Types.ObjectId();

let app: Express;
let accessToken: string;
let ownerId: string;
let createdPostId: string;

const userData = {
  _id: new mongoose.Types.ObjectId(),
  name: "John Doe",
  email: "john.doe@example.com",
  password: "password123",
  refrwshTokens: [],
};

const postData = {
  _id: new mongoose.Types.ObjectId(),
  owner: userData._id,
  title: "Test Post",
  content: "This is a test post.",
};

beforeAll(async () => {
  jest.setTimeout(10000);
  app = await initApp();

  await Post.deleteMany({ owner: postData.owner });
  await User.deleteMany({ email: userData.email });

  const registerResponse = await request(app)
  .post("/api/auth/register")
  .send(userData);
  ownerId = registerResponse.body._id;

  const loginResponse = await request(app).post("/api/auth/login").send({
    email: "john.doe@example.com",
    password: "password123",
  });
  accessToken = loginResponse.body.accessToken;
});

afterAll(async () => {
  await Post.findByIdAndDelete(createdPostId);
  await User.findByIdAndDelete(ownerId);

  // Close the MongoDB connection
  await mongoose.connection.close();
});

describe("PostController", () => {
  describe("createPost", () => {
    it("should create a new post", async () => {
      const response = await request(app)
        .post(`/api/post`)
        .send(postData)
        .set("Authorization", `JWT ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("_id");
      expect(response.body.title).toBe(postData.title);
      expect(response.body.content).toBe(postData.content);
      expect(response.status).toBe(200);

      createdPostId = response.body._id;
    });

    it("should return 401 when creating a post without authentication", async () => {
       const response = await request(app)
        .post(`/api/post`)
        .send(postData)

        expect(response.status).toBe(401);
    });

    it("should return 500 when encountering internal server error while creating a post", async () => {
      // Mocking the Post constructor to throw an error when called
      jest.spyOn(Post.prototype, "save").mockImplementation(() => {
        throw new Error("Internal Server Error");
      });

      const response = await request(app)
        .post(`/api/post`)
        .send(postData)
        .set("Authorization", `JWT ${accessToken}`)
        
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("message", "Internal Server Error");
    });
  });

  describe("updatePost", () => {
    it("should update an existing post", async () => {
      const updateData = {
        title: "This is an updated test post title",
        content: "content of updated test post",
        owner: userData._id,
      };

      const response = await request(app)
        .put(`/api/post/${createdPostId}`)
        .send(updateData)
        .set("Authorization", `JWT ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("_id");
      expect(response.body.title).toBe(updateData.title);
      expect(response.body.content).toBe(updateData.content);
      expect(response.status).toBe(200);
    });

    it("should return 401 when trying to update a post without authentication", async () => {
      const updateData = {
        title: "This is an updated test post title",
        content: "content of updated test post",
        owner: userData._id,
      };

       const response = await request(app)
        .put(`/api/post/${createdPostId}`)
        .send(updateData);

        expect(response.status).toBe(401);
    });

    it("should return 404 when updating a non-existing post", async () => {
      const nonExistingPostId = generateObjectId();

      const updateData = {
        title: "This is an updated test post title",
        content: "content of updated test post",
        owner: userData._id,
      };

      const response = await request(app)
        .put(`/api/post/${nonExistingPostId}`)
        .send(updateData)
        .set("Authorization", `JWT ${accessToken}`)
        .expect(404);

      expect(response.body).toHaveProperty("error", `Post ${nonExistingPostId} not found`);
    });

    it("should return 500 when encountering internal server error while updating a post", async () => {
      // Mocking the Post constructor to throw an error when called
      jest.spyOn(Post, "findByIdAndUpdate").mockImplementation(() => {
        throw new Error("Internal Server Error");
      });

      const response = await request(app)
        .post(`/api/post`)
        .send(postData)
        .set("Authorization", `JWT ${accessToken}`)
        
        
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("message", "Internal Server Error");
    });
  });

  it("should get all posts", async () => {
    const response = await request(app)
      .get("/api/post")
      .set("Authorization", `JWT ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it("should get a specific post by ID", async () => {
    const response = await request(app)
      .get(`/api/post/${createdPostId}`)
      .set("Authorization", `JWT ${accessToken}`);

    expect(response.status).toBe(200);
  });

  it("should return 400 when trying to get a non-valid post", async () => {
    const nonValidPostId: string = 'randomPostIdNotGenerated';

    const response = await request(app)
      .get(`/api/post/${nonValidPostId}`)
      .set("Authorization", `JWT ${accessToken}`);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error", "post id isn't valid");
  });

  it("should get posts by a specific user", async () => {
    const response = await request(app)
      .get(`/api/post?sender=${userData._id}`)
      .set("Authorization", `JWT ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body.forEach(post => {
      post.owner === userData._id
    }));
  });

  it("should return 500 when encountering internal server error while gettting posts by sender", async () => {
    // Mocking the Post constructor to throw an error when called
    jest.spyOn(Post, "aggregate").mockImplementation(() => {
      throw new Error("Internal Server Error");
    });

    const response = await request(app)
      .get(`/api/post?sender=${userData._id}`)
      .set("Authorization", `JWT ${accessToken}`)
      
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("message", "Internal Server Error");
  });
});
