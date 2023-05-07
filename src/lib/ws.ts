import logger from "./logger";
import WebSocket from "ws";

/**
 * create a websocket to allow websocker connection from browsers.
 */
export function runWebsocket(socket:  WebSocket.WebSocketServer) {
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