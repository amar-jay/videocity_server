// import type { Peer } from "../../types/types";
import { WebSocket } from "ws";

import { Peer } from "../peer";
import logger from "../logger";
import { requestEvents } from "../config";
import * as mediasoup from "mediasoup";
import { send, sendError } from "../utils";

function joinPeer(peer: Peer, allowed?: boolean): Peer[] {
  if (!allowed) {
    logger.log('Room._joinPeer() | peer not allowed [peerId:"%s"]', peer.id);
    throw new Error("Peer not allowed");
  }

  // TODO: handle returning peer and the rest of the function
}

function handleGuestPeer({ peer }: { peer: Peer }) {
  // TODO: handle guest peer
  joinPeer(peer);
}

function handlePeerClose() {
  // TODO: handle peer close
}

/**
 * Get the router RTP capabilities. This is the first message sent by the client.
 */
export function getRouterRtpCapabilities(ws: WebSocket) {
  // logger.log("getRouterRtpCapabilities called");
  send(
    ws,
    requestEvents.GET_ROUTER_RTP_CAPABILITIES,
    mediasoup.getSupportedRtpCapabilities()
  );
}
function handleSocketRequest<T extends WsRequest<unknown>>({peer, request, socket}:{peer: Peer, request: T, socket: WebSocket}) {
  //TODO: handle socket request
  switch (request.event) {
    case requestEvents.GET_ROUTER_RTP_CAPABILITIES:
      getRouterRtpCapabilities(socket)
      break;
    case requestEvents.JOIN:
      {
        if (peer.joined) {
          sendError("Peer already joined", socket);
          logger.warn("Peer already joined [peer ID: %s]", peer.id);
          return;
        }
        const { rtpCapabilities, picture, displayName, allowed } = request.data;
        peer.displayName = displayName;
        peer.picture = picture;
        peer.rtpCapabilities = rtpCapabilities;

        // Tell the new Peer about already joined Peers.
        const joinedPeers = joinPeer(peer, allowed);

        const peerInfos = joinedPeers.map((joinedPeer) => ({
        }));
        peer.joined = true;
      }
      break;
    case requestEvents.CREATE_WEBRTC_TRANSPORT:
      break;
    case requestEvents.CONNECT_WEBRTC_TRANSPORT:
      break;
    case requestEvents.PRODUCE:
      break;
    // case requestEvents.CONSUME:
    //   break;
    case requestEvents.RESUME_CONSUMER:
      break;
    case requestEvents.PAUSE_CONSUMER:
      break;
    // case requestEvents.CLOSE_CONSUMER:
    //   break;
    case requestEvents.CLOSE_PRODUCER:
      break;
    // case requestEvents.CLOSE_TRANSPORT:
    //   break;
    case requestEvents.CLOSE_PEER:
      break;
    // case requestEvents.CLOSE_ROOM:
    //   break;
    case requestEvents.GET_PRODUCER_STATS:
      break;
    case requestEvents.GET_CONSUMER_STATS:
      break;
    case requestEvents.GET_TRANSPORT_STATS:
      break;
    case requestEvents.ERROR:
      logger.error(request.event);
      break;
    default:
      sendError("Unkown event type: " + request, socket);
  }
}

function createConsumer() {
  // TODO: create consumer
}

function handleNotification(ws: WebSocket, notification: string) {
  // TODO: handle notification
}

function handleRoomOverLimit(peer: Peer) {
  handleNotification(peer.socket, "roomOverLimit");
}

export default {
  joinPeer,
  handleGuestPeer,
  handlePeerClose,
  // handlePeerRequest,
  createConsumer,
  handleNotification,
  handleRoomOverLimit,
};
