import cluster, { Worker } from "cluster";
import os from "node:os";
import "dotenv/config";
import App from "./app.ts";
import http from "node:http";

if (cluster.isPrimary) {
  primaryProcess();
} else {
  childProcess();
}

function primaryProcess() {
  const workers: number[] = [];
  let counter = 0;
  for (let i = 0; i < os.availableParallelism(); i++) {
    const workerPort = Number(process.env.PORT) + i + 1;
    const worker = cluster.fork({ WORKER_PORT: workerPort });
    workers.push(workerPort);
    console.log(`Worker ${i + 1} started on port ${workerPort}`);
  }
  const loadBalancer = http.createServer((req, res) => {
    const targetPort = workers[counter];
    counter = (counter + 1) % workers.length;

    const options = {
      hostname: "localhost",
      port: targetPort,
      path: req.url,
      method: req.method,
      headers: req.headers,
    };

    const proxy = http.request(options, (workerRes) => {
      res.writeHead(workerRes.statusCode || 500, workerRes.headers);
      workerRes.pipe(res, { end: true });
    });

    req.pipe(proxy, { end: true });
  });

  loadBalancer.listen(process.env.PORT, () => {
    console.log(
      `Load balancer is running on http://localhost:${process.env.PORT}`
    );
  });

  cluster.on("exit", (worker, code, signal) => {
    console.error(
      `Worker ${worker.process.pid} died (${signal || code}). Restarting...`
    );

    const newWorkerPort = Number(process.env.PORT) + workers.length + 1;

    const newWorker = cluster.fork({ WORKER_PORT: newWorkerPort });

    workers.push(newWorkerPort);
  });
}

function childProcess() {
  const workerPort = Number(process.env.WORKER_PORT);
  if (!workerPort) {
    console.error("Worker port is not defined!");
    process.exit(1);
  }
  const server = new App(workerPort);
  server.start();
}
