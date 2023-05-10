import type { Peer } from "./types";

function joinPeer(peer: Peer) {}

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

function handleNotification() {
  // TODO: handle notification
}

export default {
  joinPeer,
  handleGuestPeer,
  handlePeerClose,
  handlePeerRequest,
  createConsumer,
  handleNotification,
};
