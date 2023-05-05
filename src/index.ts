#!/usr/bin/env node
import express, {Express} from 'express';
import redis from 'redis';
import http from 'http';
import AwaitQueue from 'awaitqueue';
import bodyParser from 'body-parser';
import compression from "compression";
import path from 'path';
import WebSocket, { WebSocketServer } from 'ws';

// TODO: these are temporary. Move them to other files afterwards
const logger = console
const config = {
    redisOptions: {},
    staticFilesCachePeriod: 60 * 100,
    listeningPort: 3000,
    mediasoup: {
        worker: {
            logLevel: "warn",
            logTags: null
        }
    }


};

let redisClient: ReturnType<typeof redis.createClient>;
let mediasoupWorkers = new Map();
let rooms = new Map();
let app: Express;
let server: http.Server;
let socket: WebSocketServer;
let configError: any; // temporary

// a map of peers indexed by ids
const peer = new Map();

function init() {
    // node version check
    if (Number(process.versions.node.split('.')[0]) < 15) {
        throw "Node version is "+ process.versions.node + ". NodeJS 15+ only";
    }

    logger.log('- process.env.DEBUG: ', process.env?.DEBUG || true)
    logger.log('- config.mediasoup.worker.logLevel:', config.mediasoup.worker.logLevel);
    logger.log('- config.mediasoup.worker.logTags:', config.mediasoup.worker.logTags);

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
            path: '/ws',
     });

     socket.on('error', (err) => {
            logger.error('error in socket: ', err);
        }
        );
    socket.on('died', () => {
            logger.error('died in socket');
    });
     
      
}

try {
    init();
} catch (err) {
    logger.error("Initiailization Error: " + err);
    process.exit(-1);
} 

async function main() {

    runHTTPserver();
    runWebsocket();
    runMediasoupWorker();

}

/**
 * create a room given a room id
 */
function createRoom({roomid}: {roomid: string}) {
}

/**
 * create a websocket to allow websocker connection from browsers.
 */
function runHTTPserver() {
    app.use(bodyParser.json({ limit: '5mb' }));
    app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));

    // serve all files in public folder
    app.use(express.static(path.join(process.cwd(), "public"), {
        maxAge: config.staticFilesCachePeriod,
    }))

    app.use((_, res) => {
        res.status(404).send(
            `<h1>🏗️ Still in production</h1>
            <p>If you report this error, please also report this 
            <i>tracking ID</i> which makes it possible to locate your session
            in the logs which are available to the system administrator: 
                <b></b>
            </p>`
        );
    })
    server.listen(config.listeningPort, () => {
        logger.log("Server running on :", config.listeningPort)
    })
}

/**
 * create a websocket to allow websocker connection from browsers.
 */
function runWebsocket() {
    socket.on('connection', (ws, req) => {
                logger.log("new connection from " + req.socket.remoteAddress);
                ws.on('message', (message) => {
                    logger.log("received message: " + message);
                });
                ws.on('close', () => {
                    logger.log("connection closed");
                });
                ws.send('something');
            }
            );
}

/**
 * Launch mediasoup workers as specified in configuration file.
 */
function runMediasoupWorker() {
}

main();
console.log()
