import 'dotenv/config'
import App from './app.ts'

 const Server = new App(Number(process.env.PORT));
 Server.start();