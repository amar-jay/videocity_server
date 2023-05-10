// import type { Peer } from "../../types/types";
import { WebSocket } from "ws";

import { Peer } from "../peer";
import logger from "../logger";

function joinPeer(peer: Peer, allowed?: boolean) {
  if (!allowed) {
    logger.log('Room._joinPeer() | peer not allowed [peerId:"%s"]', peer.id);
    return;
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

function handlePeerRequest() {
  //TODO: handle peer request
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
  handlePeerRequest,
  createConsumer,
  handleNotification,
  handleRoomOverLimit,
};
