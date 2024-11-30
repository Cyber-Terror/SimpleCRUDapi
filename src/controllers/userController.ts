import { IncomingMessage, ServerResponse } from "http";
import { UserService } from "../service/userService.ts";
import {
  getDataFromReq,
  getPathName,
  isUuid,
  validateUser,
} from "../utils/utils.ts";
import User from "../types/user.ts";

export class UserController {
  constructor(private userService: UserService) {}

  public async requestHandler(req: IncomingMessage, res: ServerResponse) {
    const method = req.method;
    const pathname = getPathName(req) || "";
    const pathSegments = pathname.split("/");
    console.log(pathSegments);
    
    switch (method) {
      case "GET":
        if (pathSegments.length === 3) {
          this.getUsers(res);
        } else if (pathSegments.length === 4) {
          this.getUserById(req, res);
        } else {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.statusMessage =
            "Incorrect path. Example of correct path:/api/users/userId ";
          res.end(JSON.stringify({ error: res.statusMessage }));
        }
        break;
      case "POST":
        if (pathSegments.length === 3) {
          await this.postUser(req, res);
        } else {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.statusMessage =
            "Incorrect path. Example of correct path:/api/users ";
          res.end(JSON.stringify({ error: res.statusMessage }));
        }
        break;
      case "PUT":
        if (pathSegments.length === 4) {
          return await this.putUser(req, res);
        } else {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.statusMessage =
            "Incorrect path. Example of correct path:/api/users/userId ";
          res.end(JSON.stringify({ error: res.statusMessage }));
        }
        break;
      case "DELETE":
        if (pathSegments.length === 4) {
          return await this.deleteUser(req, res);
        } else {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.statusMessage =
            "Incorrect path. Example of correct path:/api/users/userId ";
          res.end(JSON.stringify({ error: res.statusMessage }));
        }
        break;
      default:
        res.writeHead(404, { "Content-Type": "application/json" });
        res.statusMessage = "Incorrect method. Only: GET POST PUT DELETE";
        res.end(JSON.stringify({ error: res.statusMessage }));
        break;
    }
  }

  public getUsers(res: ServerResponse): ServerResponse {
    try {
      const users = this.userService.getUsers();
      res.writeHead(200, { "Content-type": "application/json" });
      return res.end(JSON.stringify(users));
    } catch (error) {
      res.writeHead(404, { "Content-type": "application/json" });
      return res.end({ error: error });
    }
  }

  public getUserById(
    req: IncomingMessage,
    res: ServerResponse
  ): ServerResponse {
    try {
      const pathname = getPathName(req) || "";
      const userId = pathname.split("/")[3];
      if (!isUuid(userId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.statusMessage = "User ID is not valid";
        return res.end(JSON.stringify({ error: res.statusMessage }));
      }
      const user = this.userService.getUserById(userId);
      if (!user) {
        throw Error;
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(user));
    } catch (error) {
      res.writeHead(404, { "Contetn-Type": "application/json" });
      res.statusMessage = "User with this ID doesn't exists";
      return res.end(
        JSON.stringify({ error: error, errorMessage: res.statusMessage })
      );
    }
  }

  public async postUser(
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<ServerResponse> {
    try {
      const postData = await getDataFromReq(req);
      const parsedData = JSON.parse(postData);
      const validatedData = validateUser(parsedData);
      if (!validatedData.isValid) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify(validatedData.errors));
      }
      res.writeHead(201, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify(
          await this.userService.postUser(
            parsedData.username,
            parsedData.age,
            parsedData.hobbies
          )
        )
      );
    } catch (error) {
      res.writeHead(500, { "Contetn-Type": "application/json" });
      res.statusMessage = "Server Error";
      return res.end(
        JSON.stringify({ error: error, errorMessage: res.statusMessage })
      );
    }
  }

  public async putUser(
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<ServerResponse> {
    try {
      const putData = await getDataFromReq(req);
      const parsedData = JSON.parse(putData);
      const validatedData = validateUser(parsedData);
      const pathname = getPathName(req) || "";
      const userId = pathname.split("/")[3];
      if (!isUuid(userId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.statusMessage = "User ID is not valid";
        return res.end(JSON.stringify({ error: res.statusMessage }));
      }
      if (!validatedData.isValid) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify(validatedData.errors));
      }
      const user = this.userService.getUserById(userId);
      if (!user) {
        throw Error;
      }
      const updUser: User = {
        id: userId,
        username: parsedData.username,
        age: parsedData.age,
        hobbies: parsedData.hobbies,
      };
      res.writeHead(201, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(await this.userService.putUser(updUser)));
    } catch (error) {
      res.writeHead(404, { "Contetn-Type": "application/json" });
      res.statusMessage = "User with this ID doesn't exists";
      return res.end(
        JSON.stringify({ error: error, errorMessage: res.statusMessage })
      );
    }
  }

  public async deleteUser(
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<ServerResponse> {
    try {
      const pathname = getPathName(req) || "";
      const userId = pathname.split("/")[3];
      if (!isUuid(userId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.statusMessage = "User ID is not valid";
        return res.end(JSON.stringify({ error: res.statusMessage }));
      }
      const user = this.userService.getUserById(userId);
      if (!user) {
        throw Error;
      }
      res.writeHead(204, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(await this.userService.deleteUser(userId)));
    } catch (error) {
      res.writeHead(404, { "Contetn-Type": "application/json" });
      res.statusMessage = "User with this ID doesn't exists";
      return res.end(
        JSON.stringify({ error: error, errorMessage: res.statusMessage })
      );
    }
  }
}
