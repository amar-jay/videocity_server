import express, { Express } from "express";
import redis from "redis";
import http from "http";
import bodyParser from "body-parser";
import path from "path";
import WebSocket, { WebSocketServer } from "ws";
import * as mediasoup from "mediasoup";
import { isDev } from "./env";
import { config } from "./lib/config";
import { logger } from "./lib/logger";
import { startMediasoup } from "./lib/worker";
import { runWebsocket } from "./lib/ws";

let redisClient: ReturnType<typeof redis.createClient>;
let rooms = new Map();
let app: Express;
let server: http.Server;
let socket: WebSocketServer;
let configError: any; // temporary

// a map of peers indexed by ids
const peer = new Map();

function init() {
  // node version check
  if (Number(process.versions.node.split(".")[0]) < 15) {
    throw "Node version is " + process.versions.node + ". NodeJS 15+ only";
  }

  logger.log("- process.env.DEBUG: ", isDev);
  logger.log(
    "- config.mediasoup.worker.logLevel:",
    config.mediasoup.worker.logLevel
  );
  logger.log(
    "- config.mediasoup.worker.logTags:",
    config.mediasoup.worker.logTags
  );
  logger.log("- config.mediasoup.version:", mediasoup.version);

  // config files check
  if (!!configError) {
    throw "Invalid config file: " + configError;
  }
  redisClient = redis?.createClient(config.redisOptions);
  // TODO: change
  if (!redisClient) {
    //         throw "failed to create redis client"
  }
  app = express();
  server = http.createServer(app);
  socket = new WebSocket.Server({
    server,
    path: "/ws",
  });

  socket.on("error", (err) => {
    logger.error("error in socket: ", err);
  });
  socket.on("died", () => {
    logger.error("died in socket");
  });
}

try {
  init();
} catch (err) {
  logger.error("Initiailization Error: " + err);
  process.exit(-1);
}

/**
 * create a room given a room id
 */
function createRoom({ roomid }: { roomid: string }) {}

/**
 * create a websocket to allow websocker connection from browsers.
 */
function runHTTPserver() {
  app.use(bodyParser.json({ limit: "5mb" }));
  app.use(bodyParser.urlencoded({ limit: "5mb", extended: true }));

  // serve all files in public folder
  app.use(
    express.static(path.join(process.cwd(), "public"), {
      maxAge: config.staticFilesCachePeriod,
    })
  );

  app.use((_, res) => {
    res.status(404).send(
      `<h1>🏗️ Still in production</h1>
            <p>If you report this error, please also report this 
            <i>tracking ID</i> which makes it possible to locate your session
            in the logs which are available to the system administrator: 
                <b></b>
            </p>`
    );
  });
  server.listen(config.listeningPort, () => {
    logger.log("server running on :", config.listeningPort);
  });
}

export async function main() {
  runHTTPserver();
  startMediasoup()
    .then((workers) => {
      logger.log("mediasoup worker started");
      // TODO: pass worker to runWebsocket
      runWebsocket(socket);
    })
    .then(() => {
      logger.log("websocket server started\n");
    })
    .catch((err) => {
      logger.error("ERROR: mediasoup worker failed to start: " + err);
    });
}
