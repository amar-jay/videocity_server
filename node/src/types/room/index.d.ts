import { Room } from "@/lib/room";
import { types } from "mediasoup";
import { WebSocket } from "ws";
import { Router, Worker } from "mediasoup/lib/types";
import { MyPeer } from "./MyPeer";

export type RoomId = string;

export interface Role {
  id: string;
  name: "admin" | "guest" | "moderator";
}

export type RoomParameters = {
  roomId: RoomId;
  routers: Routers;
  audioObservers: AudioObservers;
  mediasoupWorkers?: types.Worker[];
  peers?: Map<string, Peer>;
  webrtcServer?: types.WebRtcServer;
  consumerReplicas: number;
};

export type RoomCreateParameters = {
  roomId: RoomId;
  mediasoupWorker: types.Worker;
  consumerReplicas: number;
  peers?: Map<string, Peer>;
};
export type Routers = Map<string, types.Router>;
export type AudioObservers = Map<
  string,
  { peerId: null; audioLevelObserver: types.AudioLevelObserver; volume: -1000 }
>;


export type Then<T> = T extends PromiseLike<infer U> ? U : T;

export type MyRoomState = Record<string, MyPeer>;

export type MyRooms = Record<
  string,
  { worker: Worker; router: Router; state: MyRoomState }
>;