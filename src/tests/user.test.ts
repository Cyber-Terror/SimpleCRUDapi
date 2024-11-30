import request from "supertest";
import App from "../app.ts";
import { UserController } from "../controllers/userController.ts";
import { UserService } from "../service/userService.ts";
import { UserRepository } from "../repository/userRepository.ts";

describe("User API", () => {
  let app:App;
  beforeAll(() => {
    app = new App(
      5001,
      new UserController(new UserService(new UserRepository()))
    );
    app.start();
  });
  afterAll(()=>{
    app.close();
  })

  it("GET ALL USERS", async() => {
    const response = await request(app).get("/api/users").expect(200);
    expect(response.body).toEqual([]); 
  });
  it("POST USER", () => {});

  it("DELETE USER", () => {});
});
