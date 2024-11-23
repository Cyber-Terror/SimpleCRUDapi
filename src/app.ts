import http, { IncomingMessage, ServerResponse } from "http";
import { parse } from "url";
import { getUsers, getUser } from "./controllers/getUsers.ts";
import { isUuid, validateUser } from "./controllers/utils/utils.ts";
import User from "./types/user.ts";
import postUser from "./controllers/postUser.ts";
import putUser from "./controllers/putUser.ts";
import { deleteUser } from "./controllers/deleteUser.ts";

export default class App {
  private port: number;
  private server: http.Server;

  constructor(port: number) {
    this.port = port;
    this.server = http.createServer(this.requestHandler.bind(this));
  }

  private async requestHandler(
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<void> {
    const method = req.method;
    const parsedUrl = parse(req.url || "", true);
    const pathname = parsedUrl.pathname;
    switch (method) {
      case "GET":
        if (pathname === "/api/users") {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(getUsers()));
        } else if (pathname?.startsWith("/api/users/")) {
          const pathSegments = pathname.split("/");
          if (pathSegments.length !== 4) {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.statusMessage = "Invalid URL format";
            res.end(JSON.stringify({ error: res.statusMessage }));
            return;
          }
          const userId = pathname.split("/")[3];
          const user = getUser(userId);
          if (!user) {
            res.writeHead(404, { "Contetn-Type": "application/json" });
            res.statusMessage = "User with this ID doesn't exists";
            res.end(JSON.stringify({ error: res.statusMessage }));
            return;
          }
          if (!isUuid(userId)) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.statusMessage = "User ID is not valid";
            res.end(JSON.stringify({ error: res.statusMessage }));
            return;
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(user));
          return;
        } else {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.statusMessage =
            "Unknown endpoint. You can use /api/users or /api/users/(userId) with method GET";
          res.end(JSON.stringify({ error: res.statusMessage }));
        }
        break;
      case "POST":
        if (pathname === "/api/users") {
          // eslint-disable-next-line no-case-declarations
          let data = "";
          req.on("data", (chunk: User) => {
            data += chunk;
          });
          req.on("end", async () => {
            try {
              const parsedData: User = JSON.parse(data);
              const validatedData = validateUser(parsedData);
              if (validatedData.isValid) {
                res.writeHead(201, { "Content-Type": "application/json" });
                res.end(
                  JSON.stringify(
                    await postUser(
                      parsedData.username,
                      parsedData.age,
                      parsedData.hobbies
                    )
                  )
                );
              } else {
                res.writeHead(401, { "Content-Type": "application/json" });
                res.end(JSON.stringify(validatedData.errors));
              }
            } catch (error) {
              console.error("Error parsing JSON:", error);
              res.writeHead(500, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "Invalid JSON format" }));
            }
          });
        } else {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.statusMessage =
            "Unknown endpoint. You can use /api/users with method POST";
          res.end(JSON.stringify({ error: res.statusMessage }));
        }
        break;
      case "PUT":
        if (pathname?.startsWith("/api/users/")) {
          const pathSegments = pathname.split("/");
          if (pathSegments.length !== 4) {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.statusMessage = "Invalid URL format";
            res.end(JSON.stringify({ error: res.statusMessage }));
            return;
          }
          const userId = pathname.split("/")[3];
          const user = getUser(userId);
          if (!isUuid(userId)) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.statusMessage = "User ID is not valid";
            res.end(JSON.stringify({ error: res.statusMessage }));
            return;
          }
          if (!user) {
            res.writeHead(404, { "Contetn-Type": "application/json" });
            res.statusMessage = "User with this ID doesn't exists";
            res.end(JSON.stringify({ error: res.statusMessage }));
            return;
          }
          // eslint-disable-next-line no-case-declarations
          let data = "";
          req.on("data", (chunk: User) => {
            data += chunk;
          });
          req.on("end", async () => {
            try {
              const parsedData: User = JSON.parse(data);
              const validatedData = validateUser(parsedData);
              if (validatedData.isValid) {
                const updUser: User = {
                  id: userId,
                  username: parsedData.username,
                  age: parsedData.age,
                  hobbies: parsedData.hobbies,
                };
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(await putUser(updUser)));
                return;
              }
              res.writeHead(404, { "Content-Type": "application/json" });
              res.end(JSON.stringify(validatedData.errors));
              
            } catch (error) {
              console.error("Error parsing JSON:", error);
              res.writeHead(500, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "Invalid JSON format" }));
            }
          });
        } else {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.statusMessage =
            "Unknown endpoint. You can use /api/users or /api/users/(userId) with method PUT";
          res.end(JSON.stringify({ error: res.statusMessage }));
        }
        break;
      case "DELETE":
        if (pathname?.startsWith("/api/users/")) {
          const pathSegments = pathname.split("/");
          if (pathSegments.length !== 4) {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.statusMessage = "Invalid URL format";
            res.end(JSON.stringify({ error: res.statusMessage }));
            return;
          }
          const userId = pathname.split("/")[3];
          const user = getUser(userId);
          if (!user) {
            res.writeHead(404, { "Contetn-Type": "application/json" });
            res.statusMessage = "User with this ID doesn't exists";
            res.end(JSON.stringify({ error: res.statusMessage }));
            return;
          }
          if (!isUuid(userId)) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.statusMessage = "User ID is not valid";
            res.end(JSON.stringify({ error: res.statusMessage }));
            return;
          }
          res.writeHead(204, { "Content-Type": "application/json" });
          res.end(JSON.stringify(await deleteUser(userId)));
        } else {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.statusMessage =
            "Unknown endpoint. You can use /api/users or /api/users/(userId) with method DELETE";
          res.end(JSON.stringify({ error: res.statusMessage }));
        }
        break;
      default:
        res.writeHead(404, { "Content-Type": "application/json" });
          res.statusMessage =
            "Unknown endpoint.";
          res.end(JSON.stringify({ error: res.statusMessage }));
        break;
    }
  }
  public start(): void {
    this.server.listen(this.port, () => {
      console.log(`Server works on http://localhost:${this.port}`);
    });
  }
}
