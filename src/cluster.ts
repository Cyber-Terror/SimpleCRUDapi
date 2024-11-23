import cluster, { Worker } from "cluster";
import os from "node:os";
import "dotenv/config";
import App from "./app.ts";
import http from 'node:http'
import * as url from "url";


if (cluster.isPrimary) {
  primaryProcess();
} else {
  childProcess();
}

//should send messages throu http
function primaryProcess() {
  const server = new App(Number(process.env.PORT));
  server.start();
  const workers : Worker [] = [];
  for (let i = 0; i < os.availableParallelism(); i++) {
    console.log(`Worker ${i} started ...`);
    workers.push(cluster.fork({ childPort: Number(process.env.PORT) + i + 1 }));
  }
  let counter = 0;
  http.createServer((req, res) => {
    const worker = workers[counter];
    counter = (counter + 1) % workers.length;
    const parsedUrl = url.parse(req.url || '', true);
    worker.send({ path: parsedUrl.pathname });
    worker.on('message', (message:string | http.IncomingMessage | http.ServerResponse) => {
      res.writeHead(200);
      res.end(message);
    });
  }).listen(8000);
  cluster.on("exit", (worker) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
}

function childProcess() {
  const port = Number(process.env.childPort);
  if (!port) {
    console.error("Worker port is not defined!");
    process.exit(1);
  }
  process.on('message', (message:any) => {
  const server = new App(port);
  server.start();
});
}