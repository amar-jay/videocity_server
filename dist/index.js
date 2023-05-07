#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const mediasoup = __importStar(require("mediasoup"));
const config_1 = require("./lib/config");
const logger_1 = require("./lib/logger");
const worker_1 = require("./lib/worker");
const ws_2 = require("./lib/ws");
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
    logger_1.logger.log('- process.env.DEBUG: ', ((_a = process.env) === null || _a === void 0 ? void 0 : _a.DEBUG) || true);
    logger_1.logger.log('- config.mediasoup.worker.logLevel:', config_1.config.mediasoup.worker.logLevel);
    logger_1.logger.log('- config.mediasoup.worker.logTags:', config_1.config.mediasoup.worker.logTags);
    logger_1.logger.log('- config.mediasoup.version:', mediasoup.version);
    // config files check
    if (!!configError) {
        throw "Invalid config file: " + configError;
    }
    redisClient = redis_1.default === null || redis_1.default === void 0 ? void 0 : redis_1.default.createClient(config_1.config.redisOptions);
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
        logger_1.logger.error('error in socket: ', err);
    });
    socket.on('died', () => {
        logger_1.logger.error('died in socket');
    });
}
try {
    init();
}
catch (err) {
    logger_1.logger.error("Initiailization Error: " + err);
    process.exit(-1);
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        runHTTPserver();
        yield (0, ws_2.runWebsocket)(socket);
        (0, worker_1.runMediasoupWorker)();
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
        maxAge: config_1.config.staticFilesCachePeriod,
    }));
    app.use((_, res) => {
        res.status(404).send(`<h1>🏗️ Still in production</h1>
            <p>If you report this error, please also report this 
            <i>tracking ID</i> which makes it possible to locate your session
            in the logs which are available to the system administrator: 
                <b></b>
            </p>`);
    });
    server.listen(config_1.config.listeningPort, () => {
        logger_1.logger.log("Server running on :", config_1.config.listeningPort);
    });
}
main();
console.log();
