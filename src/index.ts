import 'dotenv/config'
import App from './app.ts'
import { UserController } from './controllers/userController.ts';
import { UserService } from './service/userService.ts';
import { UserRepository } from './repository/userRepository.ts';

 const Server = new App(Number(process.env.PORT), new UserController(new UserService(new UserRepository)));
 Server.start();