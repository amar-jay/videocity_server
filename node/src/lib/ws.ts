import logger from "../utils/logger";
import WebSocket from "ws";
import * as mediasoup from "mediasoup";
import {  isValidJSON, send, sendError } from "../utils";
import { requestEvents } from "./config";
import { AwaitQueue } from "awaitqueue";
import { Room } from "./room";
import { Peer } from "./peer";
import { types } from "mediasoup";
import { log } from "console";
import { getNextMediasoupWorker } from "../utils/worker";
import { getRouterRtpCapabilities } from "./room/handlers";
import { mediasoupWorkers } from "./worker";
import { WsRequest } from "@/types";
import requestActions from "./actions";

const rooms = new Map<string, Room>();
const peers = new Map<string, Peer>();
const queue = new AwaitQueue();


const getOrCreateRoom = async (roomId: string, consumerReplicas: number) => {
  if (rooms.has(roomId)) {
    return rooms.get(roomId)!;
  }
  const worker = getNextMediasoupWorker(mediasoupWorkers);

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
      logger.warn("invalid consumer_replicas, setting to 0");
      consumerReplicas = 0;
    }

    logger.log("new connection request [room ID: %s, peer ID: %s]", );

    queue.push(async () => {
      const room = await getOrCreateRoom(roomId, consumerReplicas);
      let peer = room.getPeer(peerId)
      if (peer) {
        logger.log("peer reconnected [peer ID: %s]", peerId);
        peer.handlePeerReconnection(ws);
        return;
      }
      peer = new Peer({ id: peerId, roomId, socket: ws, consumers: new Map()});
      room.handlePeer({ peer, allowed: true });
      logger.log("new peer [peer ID: %s]", peerId);

      peer.on("close", () => {
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
      const event = isValidJSON<WsRequest<string>>(message);
      if (event === null) return sendError("Invalid JSON", ws);

      requestActions(ws, event.event);
      switch (event.event) {
        case requestEvents.GET_ROUTER_RTP_CAPABILITIES:
          getRouterRtpCapabilities(ws);
          break;

        case requestEvents.ERROR:
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
