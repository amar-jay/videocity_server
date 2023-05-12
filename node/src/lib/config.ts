import env from "../env";
import {
  WorkerSettings,
  AppData,
  RtpCapabilities,
  TransportListenIp,
  WebRtcTransportListenServer,
  WebRtcTransportListen,
  PlainTransport,
  WebRtcServerListenInfo,
} from "mediasoup/node/lib/types";
import os from "os";
import { getListenIps } from "../utils";

export const config = {
  redisOptions: {},
  staticFilesCachePeriod: 60 * 100,
  listeningPort: 3000,
  maxUsersPerRoom: 10,

  mediasoup: {
    numWorkers: Object.keys(os.cpus()).length,
    logLevel: env.MEDIASOUP_LOG_LEVEL || "debug",
    worker: {
      logTags: ["info", "ice", "dtls", "rtp", "srtp", "rtcp"],
      rtcMinPort: env.MEDIASOUP_MIN_PORT || 10000,
      rtcMaxPort: env.MEDIASOUP_MAX_PORT || 10100,
    } as WorkerSettings<AppData>,

    router: {
      mediaCodecs: [
        {
          kind: "audio",
          mimeType: "audio/opus",
          clockRate: 48000,
          channels: 2,
        },
        {
          kind: "video",
          mimeType: "video/VP8",
          clockRate: 90000,
          parameters: {
            "x-google-start-bitrate": 1000,
          },
        },
        {
          kind: "video",
          mimeType: "video/VP9",
          clockRate: 90000,
          parameters: {
            "profile-id": 2,
            "x-google-start-bitrate": 1000,
          },
        },
        {
          kind: "video",
          mimeType: "video/h264",
          clockRate: 90000,
          parameters: {
            "packetization-mode": 1,
            "profile-level-id": "4d0032",
            "level-asymmetry-allowed": 1,
            "x-google-start-bitrate": 1000,
          },
        },
      ] as RtpCapabilities["codecs"],
      // Audio level observer interval in milliseconds.
      audioLevelObserver: {
        maxEntries: 1,
        threshold: -80,
        interval: 800,
      },
    },

    // WebRtcTransport settings
    webRtcTransport: {
      listenIps: getListenIps() as TransportListenIp[],
      initialAvailableOutgoingBitrate: 1000000,
      minimumAvailableOutgoingBitrate: 600000,
      maxSctpMessageSize: 262144,
      maxIncomingBitrate: 1500000, //optional
    } as const,

    // WebRtcServer settings
    webRtcServer: {
      listenInfos: [
        {
          port: 44444,
          protocol: "tcp",
          ip: env.MEDIASOUP_LISTEN_IP || "0.0.0.0",
          announcedIp: env.MEDIASOUP_ANNOUNCED_IP, // this is the public IP address
        },

        {
          port: 44444,
          protocol: "udp",
          ip: env.MEDIASOUP_LISTEN_IP || "0.0.0.0",
          announcedIp: env.MEDIASOUP_ANNOUNCED_IP, // this is the public IP address
        },
      ] as (WebRtcServerListenInfo & { port: number })[],
      //satisfies WebRtcTransportListen[] ,
    },

    // config og transport for RTP and Gstreamer
    plainTransport: {
      listenIp: {
        ip: env.MEDIASOUP_LISTEN_IP,
        announcedIp: env.MEDIASOUP_ANNOUNCED_IP,
      } as TransportListenIp,
      maxSctpMessageSize: 262144,
    } as const,
  },
};

export const requestEvents = {
  GET_ROUTER_RTP_CAPABILITIES: "getRouterRtpCapabilities",
  JOIN: "join",
  CREATE_WEBRTC_TRANSPORT:  "createWebrtcTransport",
  CONNECT_WEBRTC_TRANSPORT:  "connectWebrtcTransport",
  RESTART_ICE: "restartIce",
  PRODUCE: "produce",
  CLOSE_PRODUCER: "closeProducer",
  PAUSE_PRODUCER: "pauseProducer",
  RESUME_PRODUCER: "resumeProducer",
  PAUSE_CONSUMER: "pauseConsumer",
  RESUME_CONSUMER: "resumeProducer",

  REQUEST_CONSUMER_KEY_FRAME: "requestConsumerKeyFrame",
  GET_PRODUCER_STATS: "getProducerStats",
  GET_TRANSPORT_STATS: "getTransportStats",
  GET_CONSUMER_STATS: "getConsumerStats",
  CLOSE_PEER: "closePeer",
  CHAT_MESSAGE: "chatMessage",

  SYNC_DOC_INFOMATION: "syncDocInfomation",
  CLASS_START: "classStart",
  CLASS_STOP: "classStop",
  ROOM_INFO: "roomInfo",
  CHANGE_DISPLAY_NALE: "changeDisplayName",
  CHANGE_ROLE: "change_role",

  CONNECT_VIDEO: "connectVideo",
  DISCONNECT_VIDEO: "disconnectVideo",
  CONNECT_APPROVAL: "connectApproval",
  SWITCH_COMPONENT: "switchComponent",

  MUTED: "muted",
  UNMUTED: "unmuted",

  ERROR: "error",
} as const;
export type RequestEvents = typeof requestEvents
export default config;
