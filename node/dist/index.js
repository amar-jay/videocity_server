#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const redis_1 = __importDefault(require("redis"));
const http_1 = __importDefault(require("http"));
const body_parser_1 = __importDefault(require("body-parser"));
const path_1 = __importDefault(require("path"));
const ws_1 = __importDefault(require("ws"));
// TODO: these are temporary. Move them to other files afterwards
const logger = console;
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
let redisClient;
let mediasoupWorkers = new Map();
let rooms = new Map();
let app;
let server;
let socket;
let configError; // temporary
// a map of peers indexed by ids
const peer = new Map();
function init() {
    var _a;
    // node version check
    if (Number(process.versions.node.split('.')[0]) < 15) {
        throw "Node version is " + process.versions.node + ". NodeJS 15+ only";
    }
    logger.log('- process.env.DEBUG: ', ((_a = process.env) === null || _a === void 0 ? void 0 : _a.DEBUG) || true);
    logger.log('- config.mediasoup.worker.logLevel:', config.mediasoup.worker.logLevel);
    logger.log('- config.mediasoup.worker.logTags:', config.mediasoup.worker.logTags);
    // config files check
    if (!!configError) {
        throw "Invalid config file: " + configError;
    }
    redisClient = redis_1.default === null || redis_1.default === void 0 ? void 0 : redis_1.default.createClient(config.redisOptions);
    // TODO: change
    if (!redisClient) {
        //         throw "failed to create redis client"
    }
    app = (0, express_1.default)();
    server = http_1.default.createServer(app);
    socket = new ws_1.default.Server({
        server,
        path: '/ws',
    });
    socket.on('error', (err) => {
        logger.error('error in socket: ', err);
    });
    socket.on('died', () => {
        logger.error('died in socket');
    });
}
try {
    init();
}
catch (err) {
    logger.error("Initiailization Error: " + err);
    process.exit(-1);
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        runHTTPserver();
        runWebsocket();
        runMediasoupWorker();
    });
}
/**
 * create a room given a room id
 */
function createRoom({ roomid }) {
}
/**
 * create a websocket to allow websocker connection from browsers.
 */
function runHTTPserver() {
    app.use(body_parser_1.default.json({ limit: '5mb' }));
    app.use(body_parser_1.default.urlencoded({ limit: '5mb', extended: true }));
    // serve all files in public folder
    app.use(express_1.default.static(path_1.default.join(process.cwd(), "public"), {
        maxAge: config.staticFilesCachePeriod,
    }));
    app.use((_, res) => {
        res.status(404).send(`<h1>🏗️ Still in production</h1>
            <p>If you report this error, please also report this 
            <i>tracking ID</i> which makes it possible to locate your session
            in the logs which are available to the system administrator: 
                <b></b>
            </p>`);
    });
    server.listen(config.listeningPort, () => {
        logger.log("Server running on :", config.listeningPort);
    });
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
    });
}
/**
 * Launch mediasoup workers as specified in configuration file.
 */
function runMediasoupWorker() {
}
main();
console.log();
