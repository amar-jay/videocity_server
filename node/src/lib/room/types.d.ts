import { types } from "mediasoup";

export type RoomId = string;

export type Peer = {
  id: string;
  roles: unknown[];
};
export type RoomParameters = {
  roomId: RoomId;
  routers: Routers;
  audioObservers: AudioObservers;
  mediasoupWorkers: types.Worker[];
  peers: Map<string, unknown>; // TODO: set type
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
