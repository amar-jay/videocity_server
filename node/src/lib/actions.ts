import { WsRequest } from "@/types";
import { WebSocket } from "ws";
import { RequestEvents, requestEvents } from "./config";
import * as mediasoup from "mediasoup";
import { send, sendError } from "../utils";
import logger from "@/utils/logger";
import { Peer } from "./peer";

export default function requestActions(
  socket: WebSocket,
  event: RequestEvents[keyof RequestEvents]
) {
  if (!(event in (actions as any))) {
    sendError("Unkown event type: " + event, socket);
    return;
  }

  actions[event]({ socket, request: { event, data: {} }, peer: null });
}

const actions = {
  [requestEvents.GET_ROUTER_RTP_CAPABILITIES]({
    socket,
    request,
    peer,
  }: {
    peer: Peer | null;
    socket: WebSocket;
    request: WsRequest<unknown>;
  }) {
    // logger.log("getRouterRtpCapabilities called");
    send(
      socket,
      requestEvents.GET_ROUTER_RTP_CAPABILITIES,
      mediasoup.getSupportedRtpCapabilities()
    );
  },
  [requestEvents.JOIN]: ({
    socket,
    request,
    peer,
  }: {
    peer: Peer | null;
    socket: WebSocket;
    request: WsRequest<unknown>;
  }) => {
    if (peer?.joined) {
      sendError("Peer | null already joined", socket);
      logger.warn("Peer | null already joined [peer ID: %s]", peer.id);
      return;
    }
  },
  [requestEvents.CREATE_WEBRTC_TRANSPORT]: ({
    socket,
    request,
    peer,
  }: {
    peer: Peer | null;
    socket: WebSocket;
    request: WsRequest<unknown>;
  }) => {},
  [requestEvents.CONNECT_WEBRTC_TRANSPORT]: ({
    socket,
    request,
    peer,
  }: {
    peer: Peer | null;
    socket: WebSocket;
    request: WsRequest<unknown>;
  }) => {},
  [requestEvents.RESTART_ICE]: ({
    socket,
    request,
    peer,
  }: {
    peer: Peer | null;
    socket: WebSocket;
    request: WsRequest<unknown>;
  }) => {},
  [requestEvents.PRODUCE]: ({
    socket,
    request,
    peer,
  }: {
    peer: Peer | null;
    socket: WebSocket;
    request: WsRequest<unknown>;
  }) => {},
  [requestEvents.CLOSE_PRODUCER]: ({
    socket,
    request,
    peer,
  }: {
    peer: Peer | null;
    socket: WebSocket;
    request: WsRequest<unknown>;
  }) => {},
  [requestEvents.PAUSE_PRODUCER]: ({
    socket,
    request,
    peer,
  }: {
    peer: Peer | null;
    socket: WebSocket;
    request: WsRequest<unknown>;
  }) => {},
  [requestEvents.RESUME_PRODUCER]: ({
    socket,
    request,
    peer,
  }: {
    peer: Peer | null;
    socket: WebSocket;
    request: WsRequest<unknown>;
  }) => {},
  [requestEvents.PAUSE_CONSUMER]: ({
    socket,
    request,
    peer,
  }: {
    peer: Peer | null;
    socket: WebSocket;
    request: WsRequest<unknown>;
  }) => {},
  [requestEvents.RESUME_CONSUMER]: ({
    socket,
    request,
    peer,
  }: {
    peer: Peer | null;
    socket: WebSocket;
    request: WsRequest<unknown>;
  }) => {},

  [requestEvents.REQUEST_CONSUMER_KEY_FRAME]: ({
    socket,
    request,
    peer,
  }: {
    peer: Peer | null;
    socket: WebSocket;
    request: WsRequest<unknown>;
  }) => {},
  [requestEvents.GET_PRODUCER_STATS]: ({
    socket,
    request,
    peer,
  }: {
    peer: Peer | null;
    socket: WebSocket;
    request: WsRequest<unknown>;
  }) => {},
  [requestEvents.GET_TRANSPORT_STATS]: ({
    socket,
    request,
    peer,
  }: {
    peer: Peer | null;
    socket: WebSocket;
    request: WsRequest<unknown>;
  }) => {},
  [requestEvents.GET_CONSUMER_STATS]: ({
    socket,
    request,
    peer,
  }: {
    peer: Peer | null;
    socket: WebSocket;
    request: WsRequest<unknown>;
  }) => {},
  [requestEvents.CLOSE_PEER]: ({
    socket,
    request,
    peer,
  }: {
    peer: Peer | null;
    socket: WebSocket;
    request: WsRequest<unknown>;
  }) => {},
  [requestEvents.CHAT_MESSAGE]: ({
    socket,
    request,
    peer,
  }: {
    peer: Peer | null;
    socket: WebSocket;
    request: WsRequest<unknown>;
  }) => {},

  [requestEvents.SYNC_DOC_INFOMATION]: ({
    socket,
    request,
    peer,
  }: {
    peer: Peer | null;
    socket: WebSocket;
    request: WsRequest<unknown>;
  }) => {},
  [requestEvents.CLASS_START]: ({
    socket,
    request,
    peer,
  }: {
    peer: Peer | null;
    socket: WebSocket;
    request: WsRequest<unknown>;
  }) => {},
  [requestEvents.CLASS_STOP]: ({
    socket,
    request,
    peer,
  }: {
    peer: Peer | null;
    socket: WebSocket;
    request: WsRequest<unknown>;
  }) => {},
  [requestEvents.ROOM_INFO]: ({
    socket,
    request,
    peer,
  }: {
    peer: Peer | null;
    socket: WebSocket;
    request: WsRequest<unknown>;
  }) => {},
  [requestEvents.CHANGE_DISPLAY_NALE]: ({
    socket,
    request,
    peer,
  }: {
    peer: Peer | null;
    socket: WebSocket;
    request: WsRequest<unknown>;
  }) => {},
  [requestEvents.CHANGE_ROLE]: ({
    socket,
    request,
    peer,
  }: {
    peer: Peer | null;
    socket: WebSocket;
    request: WsRequest<unknown>;
  }) => {},

  [requestEvents.CONNECT_VIDEO]: ({
    socket,
    request,
    peer,
  }: {
    peer: Peer | null;
    socket: WebSocket;
    request: WsRequest<unknown>;
  }) => {},
  [requestEvents.DISCONNECT_VIDEO]: ({
    socket,
    request,
    peer,
  }: {
    peer: Peer | null;
    socket: WebSocket;
    request: WsRequest<unknown>;
  }) => {},
  [requestEvents.CONNECT_APPROVAL]: ({
    socket,
    request,
    peer,
  }: {
    peer: Peer | null;
    socket: WebSocket;
    request: WsRequest<unknown>;
  }) => {},
  [requestEvents.SWITCH_COMPONENT]: ({
    socket,
    request,
    peer,
  }: {
    peer: Peer | null;
    socket: WebSocket;
    request: WsRequest<unknown>;
  }) => {},

  [requestEvents.MUTED]: ({
    socket,
    request,
    peer,
  }: {
    peer: Peer | null;
    socket: WebSocket;
    request: WsRequest<unknown>;
  }) => {},
  [requestEvents.UNMUTED]: ({
    socket,
    request,
    peer,
  }: {
    peer: Peer | null;
    socket: WebSocket;
    request: WsRequest<unknown>;
  }) => {},

  [requestEvents.ERROR]: ({
    socket,
    request,
    peer,
  }: {
    peer: Peer | null;
    socket: WebSocket;
    request: WsRequest<unknown>;
  }) => {
    logger.error("error event");
    sendError("error event", socket);
  },
} as const;
