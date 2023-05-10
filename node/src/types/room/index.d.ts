import { Room } from "@/lib/room";
import { types } from "mediasoup";
import { WebSocket } from "ws";

export type RoomId = string;

export interface Role {
  id: string;
  name: "admin" | "guest" | "moderator";
}
export interface Peer {
  id: string;
  displayName: string;
  email: string;
  roles: unknown[];
  isClosed: boolean;
  roomId: string;
  socket: WebSocket;
  rtpCapabilities: types.RtpCapabilities;
}
export type RoomParameters = {
  roomId: RoomId;
  routers: Routers;
  audioObservers: AudioObservers;
  mediasoupWorkers: types.Worker[];
  peers: Map<string, Peer>;
};

export type RoomCreateParameters = Omit<
  RoomParameters,
  "routers" | "audioObservers"
>;
export type Routers = Map<string, types.Router>;
export type AudioObservers = Map<
  string,
  { peerId: null; audioLevelObserver: types.AudioLevelObserver; volume: -1000 }
>;
