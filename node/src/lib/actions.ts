import { WsRequest } from '@/types';
import { WebSocket } from 'ws';
import { RequestEvents, requestEvents } from './config';
import * as mediasoup from 'mediasoup';
import { send, sendError } from '../utils';
import logger from '@/utils/logger';
import { Peer } from './peer';


export default function requestActions(socket: WebSocket ,events: RequestEvents[keyof RequestEvents]) {
	if (!(events in (actions as any))) {
		sendError("Unkown event type: " + events, socket);
		return;
	}

	(actions)[events]({socket, request: {event: events },});


}

const actions = {
  [requestEvents.GET_ROUTER_RTP_CAPABILITIES]({socket, request, peer}: {peer: Peer, socket: WebSocket, request: WsRequest<Peer>}){
		// logger.log("getRouterRtpCapabilities called");
		send(
			socket,
			requestEvents.GET_ROUTER_RTP_CAPABILITIES,
			mediasoup.getSupportedRtpCapabilities()
		);

  },
  [requestEvents.JOIN]: ({socket, request, peer}: {peer: Peer, socket: WebSocket, request: WsRequest<Peer>}) => {
		if (peer.joined) {
			sendError("Peer already joined", socket);
			logger.warn("Peer already joined [peer ID: %s]", peer.id);
			return;
		}
  },
  [requestEvents.CREATE_WEBRTC_TRANSPORT]: ({socket, request, peer}: {peer: Peer, socket: WebSocket, request: WsRequest<Peer>}) => v,
  [requestEvents.CONNECT_WEBRTC_TRANSPORT]: ({socket, request, peer}: {peer: Peer, socket: WebSocket, request: WsRequest<Peer>}) => {},
  [requestEvents.RESTART_ICE]: ({socket, request, peer}: {peer: Peer, socket: WebSocket, request: WsRequest<Peer>}) => {},
  [requestEvents.PRODUCE]: ({socket, request, peer}: {peer: Peer, socket: WebSocket, request: WsRequest<Peer>}) => {},
  [requestEvents.CLOSE_PRODUCER]: ({socket, request, peer}: {peer: Peer, socket: WebSocket, request: WsRequest<Peer>}) => {},
  [requestEvents.PAUSE_PRODUCER]: ({socket, request, peer}: {peer: Peer, socket: WebSocket, request: WsRequest<Peer>}) => {},
  [requestEvents.RESUME_PRODUCER]: ({socket, request, peer}: {peer: Peer, socket: WebSocket, request: WsRequest<Peer>}) => {},
  [requestEvents.PAUSE_CONSUMER]: ({socket, request, peer}: {peer: Peer, socket: WebSocket, request: WsRequest<Peer>}) => {},
  [requestEvents.RESUME_CONSUMER]: ({socket, request, peer}: {peer: Peer, socket: WebSocket, request: WsRequest<Peer>}) => {},

  [requestEvents.REQUEST_CONSUMER_KEY_FRAME]: ({socket, request, peer}: {peer: Peer, socket: WebSocket, request: WsRequest<Peer>}) => {},
  [requestEvents.GET_PRODUCER_STATS]: ({socket, request, peer}: {peer: Peer, socket: WebSocket, request: WsRequest<Peer>}) => {},
  [requestEvents.GET_TRANSPORT_STATS]: ({socket, request, peer}: {peer: Peer, socket: WebSocket, request: WsRequest<Peer>}) => {},
  [requestEvents.GET_CONSUMER_STATS]: ({socket, request, peer}: {peer: Peer, socket: WebSocket, request: WsRequest<Peer>}) => {},
  [requestEvents.CLOSE_PEER]: ({socket, request, peer}: {peer: Peer, socket: WebSocket, request: WsRequest<Peer>}) => {},
  [requestEvents.CHAT_MESSAGE]: ({socket, request, peer}: {peer: Peer, socket: WebSocket, request: WsRequest<Peer>}) => {},

  [requestEvents.SYNC_DOC_INFOMATION]: ({socket, request, peer}: {peer: Peer, socket: WebSocket, request: WsRequest<Peer>}) => {},
  [requestEvents.CLASS_START]: ({socket, request, peer}: {peer: Peer, socket: WebSocket, request: WsRequest<Peer>}) => {},
  [requestEvents.CLASS_STOP]: ({socket, request, peer}: {peer: Peer, socket: WebSocket, request: WsRequest<Peer>}) => {},
  [requestEvents.ROOM_INFO]: ({socket, request, peer}: {peer: Peer, socket: WebSocket, request: WsRequest<Peer>}) => {},
  [requestEvents.CHANGE_DISPLAY_NALE]: ({socket, request, peer}: {peer: Peer, socket: WebSocket, request: WsRequest<Peer>}) => {},
  [requestEvents.CHANGE_ROLE]: ({socket, request, peer}: {peer: Peer, socket: WebSocket, request: WsRequest<Peer>}) => {},

  [requestEvents.CONNECT_VIDEO]: ({socket, request, peer}: {peer: Peer, socket: WebSocket, request: WsRequest<Peer>}) => {},
  [requestEvents.DISCONNECT_VIDEO]: ({socket, request, peer}: {peer: Peer, socket: WebSocket, request: WsRequest<Peer>}) => {},
  [requestEvents.CONNECT_APPROVAL]: ({socket, request, peer}: {peer: Peer, socket: WebSocket, request: WsRequest<Peer>}) => {},
  [requestEvents.SWITCH_COMPONENT]: ({socket, request, peer}: {peer: Peer, socket: WebSocket, request: WsRequest<Peer>}) => {},

  [requestEvents.MUTED]: ({socket, request, peer}: {peer: Peer, socket: WebSocket, request: WsRequest<Peer>}) => {},
  [requestEvents.UNMUTED]: ({socket, request, peer}: {peer: Peer, socket: WebSocket, request: WsRequest<Peer>}) => {},

  [requestEvents.ERROR]: ({socket, request, peer}: {peer: Peer, socket: WebSocket, request: WsRequest<Peer>}) => {
		logger.error("error event");
		sendError("error event", socket);
  },
} as const;