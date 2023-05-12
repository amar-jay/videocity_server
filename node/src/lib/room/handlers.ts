// import type { Peer } from "../../types/types";
import { WebSocket } from "ws";

import { Peer } from "../peer";
import logger from "../../utils/logger";
import config, { requestEvents } from "../config";
import * as mediasoup from "mediasoup";
import { send, sendError } from "../../utils";
import { Router } from "express";
import { types } from "mediasoup";
import { MyPeer } from "@/types/peer";
import { MyRooms } from "@/types/room";
import { WsRequest } from "@/types";

function joinPeer(peer: Peer, allowed?: boolean): Peer[] {
  if (!allowed) {
    logger.log('Room._joinPeer() | peer not allowed [peerId:"%s"]', peer.id);
    throw new Error("Peer not allowed");
  }

  // TODO: handle returning peer and the rest of the function
  return [peer];
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
function handleSocketRequest<T extends WsRequest<Peer>>({
  peer,
  request,
  socket,
}: {
  peer: Peer;
  request: T;
  socket: WebSocket;
}) {
  //TODO: handle socket request
  switch (request.event) {
    case requestEvents.GET_ROUTER_RTP_CAPABILITIES:
      getRouterRtpCapabilities(socket);
      break;
    case requestEvents.JOIN:
      {
        if (peer.joined) {
          sendError("Peer already joined", socket);
          logger.warn("Peer already joined [peer ID: %s]", peer.id);
          return;
        }
        const { rtpCapabilities, picture, displayName } = request.data;
        peer.displayName = displayName;
        peer.picture = picture;
        peer.rtpCapabilities = rtpCapabilities;

        // Tell the new Peer about already joined Peers.
        const joinedPeers = joinPeer(peer, true);

        const peerInfos = joinedPeers.map((joinedPeer) => ({}));
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

function handleNotification(ws: WebSocket, notification: string) {
  // TODO: handle notification
}

function handleRoomOverLimit(peer: Peer) {
  handleNotification(peer.socket, "roomOverLimit");
}

/**
 * Create WebRTC Transport
 */
async function createWebrtcTransport({
  peerId,
  router,
  clientDirection,
}: WebRtcTransportOptions): Promise<
  types.WebRtcTransport<Omit<WebRtcTransportOptions, "router">>
> {
  logger.log("creating transport for [peer id: %s]", peerId);

  const { listenIps, initialAvailableOutgoingBitrate } =
    config.mediasoup.webRtcTransport;

  const transport = await router.createWebRtcTransport({
    listenIps,
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
    initialAvailableOutgoingBitrate,
    appData: { peerId, clientDirection },
  });
  return transport;
}

/**
 * Create WebRTC Consumer
 */
async function createWebRtcConsumer({
  transport,
  producer,
  rtpCapabilities,
  router,
  peerId,
  consumingPeer,
}: WebRtcConsumerOptions): Promise<Consumer> {
  const mediaPeerId = producer.appData.peerId;

  if (!router.canConsume({ producerId: producer.id, rtpCapabilities })) {
    throw new Error(
      `recv-track: client cannot consume [peerid: ${producer.appData.peerId}]`
    );
  }
  const consumer = await transport.consume({
    producerId: producer.id,
    rtpCapabilities,
    paused: false, // see notes on pausing
    appData: { peerId, mediaPeerId },
  });

  consumingPeer.consumers.set(consumer.id, consumer);

  return {
    peerId: producer.appData.peerId as string,
    consumerParameters: {
      producerId: producer.id,
      id: consumer.id,
      kind: consumer.kind,
      rtpParameters: consumer.rtpParameters,
      type: consumer.type,
      producerPaused: consumer.producerPaused,
    },
  };
}

function deleteRoom({ roomId, rooms }: { roomId: string; rooms: MyRooms }) {
  if (!(roomId in rooms)) {
    return;
  }

  delete rooms[roomId];
}
export default {
  joinPeer,
  handleGuestPeer,
  handlePeerClose,
  // handlePeerRequest,
  // createConsumer,
  handleNotification,
  handleRoomOverLimit,
  createWebRtcConsumer,
  createWebrtcTransport,
  deleteRoom,
};

interface WebRtcTransportOptions {
  peerId: string;
  clientDirection: "send" | "recieve";
  router: types.Router;
}

interface WebRtcConsumerOptions {
  router: types.Router;
  producer: types.Producer;
  rtpCapabilities: types.RtpCapabilities;
  transport: types.Transport;
  paused: types.Producer["paused"];
  peerId: string;
  consumingPeer: MyPeer;
}

export interface Consumer {
  peerId: string;
  consumerParameters: {
    producerId: string;
    id: string;
    kind: string;
    rtpParameters: types.RtpParameters;
    type: types.ConsumerType;
    producerPaused: boolean;
  };
}
