import request from "supertest";
import App from "../app.ts";
import http from "http";

describe("User API", () => {
  let app: App;
  let server: http.Server;

  beforeAll(() => {
    app = new App(5001);
    server = app["server"];
    app.start();
  });

  afterAll(() => {
    app.close();
  });

  it("GET ALL USERS", async () => {
    const response = await request(server).get("/api/users").expect(200);
    expect(response.body).toEqual([]);
  });

  it("POST USER and DELETE", async () => {
    const newUser = { username: "alex", age: 15, hobbies: ["ride a bike"] };
    const response = await request(server)
      .post("/api/users")
      .send(newUser)
      .expect(201);
    expect(response.body).toMatchObject(newUser);
    const userId = response.body.id;
    await request(server).delete(`/api/users/${userId}`).expect(204);
    const responseDelete = await request(server)
      .get(`/api/users/${userId}`)
      .expect(404);
    expect(responseDelete.body).toEqual({
      message: "User with this ID doesn't exists",
    });
  });
});
