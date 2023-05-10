import logger from "./logger";
import WebSocket from "ws";
import * as mediasoup from "mediasoup";
import {  isValidJSON, send, sendError } from "./utils";
import { events } from "./config";
import { AwaitQueue } from "awaitqueue";
import { Room } from "./room";
import { Peer } from "./peer";
import { types } from "mediasoup";
import { log } from "console";
import { getNextMediasoupWorker } from "./worker";

const rooms = new Map<string, Room>();
const peers = new Map<string, Peer>();
const queue = new AwaitQueue();
/**
 * Get the router RTP capabilities. This is the first message sent by the client.
 */
export function getRouterRtpCapabilities(ws: WebSocket) {
  // logger.log("getRouterRtpCapabilities called");
  send(
    ws,
    events.GET_ROUTER_RTP_CAPABILITIES,
    mediasoup.getSupportedRtpCapabilities()
  );
}

const getOrCreateRoom = async (roomId: string, consumerReplicas: number) => {
  if (rooms.has(roomId)) {
    return rooms.get(roomId)!;
  }
  const worker = getNextMediasoupWorker();

  // create a new room if it doesn't exist
  logger.log("\t- creating new room [roomid: %s]", roomId);
    let room = await Room.create({
      roomId,
      mediasoupWorker: worker,
      consumerReplicas
    });
    rooms.set(roomId, room);
    room.on("close", () => rooms.delete(roomId));
    return room;
};

/**
 * create a websocket to allow websocker connection from browsers.
 */
export function runWebsocket(
  socket: WebSocket.WebSocketServer,
) {
  socket.on("connection", (ws, req) => {
    
    if (!req.url || req.headers.host === undefined){
      logger.log("no url in request header, cannot create websocket");
      return;
    }

    const url = new URL(req.url, req.headers.origin);
    const [roomId, peerId ] = [url.searchParams.get("room_id"), url.searchParams.get("peer_id") ];
    let consumerReplicas = Number(url.searchParams.get("consumer_replicas"));

    if (!roomId || !peerId) {
      logger.warn("invalid url, cannot create websocket");
      sendError("invalid url, cannot create websocket", ws);
      return;
    }

    if (!consumerReplicas || consumerReplicas < 1 || isNaN(consumerReplicas)) {
      consumerReplicas = 0;
    }

    logger.log("new connection request [room ID: %s, peer ID: %s]", );

    queue.push(async () => {
      const room = await getOrCreateRoom(roomId, consumerReplicas);
      const peer = peers.get(peerId!) || new Peer({ id: peerId, roomId, socket: ws});
      peers.set(peerId!, peer);

      peer.on("close", () => {
        peers.delete(peerId);
        logger.log("peer closed [peer ID: %s]", peerId);
      });

      room.handlePeer({ peer, allowed: true });

    })
    .catch((error) =>
			{
				logger.error('room creation or room joining failed:%o', error);

        sendError(error.toString(), ws);
        ws.close();
			});

    ws.on("message", (message) => {
      // logger.log("received message: " + message);
      const event = isValidJSON<{ data: any; event: string }>(message);
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

      logger.log(event?.data);
    });
    ws.on("close", () => {
      logger.log("connection closed");
    });
  });
}
