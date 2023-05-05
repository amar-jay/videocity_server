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
const path_1 = __importDefault(require("path"));
// TODO: these are temporary. Move them to other files afterwards
const logger = console;
const config = {
    redisOptions: {},
    staticFilesCachePeriod: 60 * 100,
    listeningPort: 3000,
};
let redisClient;
let mediasoupWorkers = new Map();
let rooms = new Map();
let app;
let configError; // temporary
// a map of peers indexed by ids
const peer = new Map();
function init() {
    // node version check
    if (Number(process.versions.node.split('.')[0]) < 15) {
        logger.warn("Node version is " + process.versions.node + ". NodeJS 15+ only");
        process.exit(-1);
    }
    // config files check
    if (!!configError) {
        throw "Invalid config file: " + configError;
    }
    const redisClient = redis_1.default.createClient(config.redisOptions);
    app = (0, express_1.default)();
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
        init();
        // serve all files in public folder
        app.use(express_1.default.static(path_1.default.join(process.cwd(), "public"), {
            maxAge: config.staticFilesCachePeriod,
        }));
        app.listen(config.listeningPort);
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
function runWebsocket() {
}
/**
 * Launch mediasoup workers as specified in configuration file.
 */
function runMediasoupWorker() {
}
main();
console.log();
