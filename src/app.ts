import http, { IncomingMessage, ServerResponse } from "http";
import { getPathName, incorrectPath } from "./utils/utils.ts";
import { UserController } from "./controllers/userController.ts";

export default class App {
  private port: number;
  private server: http.Server;
  private userController: UserController;

  constructor(port: number) {
    this.port = port;
    this.server = http.createServer(this.requestHandler.bind(this));
    this.userController = new UserController();
  }

  private async requestHandler(
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<void> {
    const pathname = getPathName(req);
    if (pathname?.startsWith("/api/users/") || pathname === "/api/users") {
      await this.userController.requestHandler(req, res);
    } else {
      incorrectPath(res);
    }
  }
  public start(): void {
    this.server.listen(this.port, () => {
      console.log(`Server works on http://localhost:${this.port}`);
    });
  }

  public close(): void {
    this.server.close();
  }
}
