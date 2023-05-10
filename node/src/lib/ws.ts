import logger from "./logger";
import WebSocket from "ws";
import * as mediasoup from "mediasoup";
import { isValidJSON, send, sendError } from "./utils";
import { events } from "./config";


/**
 * Get the router RTP capabilities. This is the first message sent by the client.
 */
export function getRouterRtpCapabilities(ws: WebSocket) {
    // logger.log("getRouterRtpCapabilities called");
    send(ws, events.GET_ROUTER_RTP_CAPABILITIES, mediasoup.getSupportedRtpCapabilities());
}
/**
 * create a websocket to allow websocker connection from browsers.
 */
export function runWebsocket(socket:  WebSocket.WebSocketServer, worker: mediasoup.types.Router) {
    socket.on('connection', (ws, req) => {
                logger.log("new connection from " + req.socket.remoteAddress);
                ws.on('message', (message) => {
                    // logger.log("received message: " + message);
                    const event = isValidJSON<{data: any, event: string}>(message) 
                    if (event === null) return sendError("Invalid JSON", ws);

                    switch (event.event) {
                        case events.GET_ROUTER_RTP_CAPABILITIES:
                            getRouterRtpCapabilities(ws);
                            break;

                        case events.ERROR:
                            logger.error(event.event);
                            break;
                        default:
                            sendError("Unkown event type: " + event, ws);
                    }

                    logger.log(event?.data)
                });
                ws.on('close', () => {
                    logger.log("connection closed");
                });
            }
        );
}



