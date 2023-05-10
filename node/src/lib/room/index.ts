import logger from "../logger";
import { EventEmitter } from "events";
import config from "../config";
import { AwaitQueue } from "awaitqueue";
import { v4 as uuid } from "uuid";
import handlers from "./handlers";
import type {
  RoomParameters,
  RoomCreateParameters,
  AudioObservers,
  Routers,
} from "@/types/room";
import type { Peer } from "@/lib/peer";
import { types } from "mediasoup";

const { mediaCodecs } = config.mediasoup.router;
export class Room extends EventEmitter {
  private readonly _roomId: RoomParameters["roomId"];
  /** room nano id */
  private readonly _id: string;

  /** queue */
  private _queue: AwaitQueue | null = null;

  /** mediasoup workers map */
  private _mediasoupWorkers: RoomParameters["mediasoupWorkers"];

  private _routers: RoomParameters["routers"];

  /** audio observers map*/
  private _audioObservers: RoomParameters["audioObservers"];

  private _closed: boolean;
  private _locked: boolean;

  /** This is empty by default and specific to an instance
   * indexed by peer id
   */
  private _peers: Map<string, Peer>;

  /** This represents all existing peer connections and it is passed in factory */
  private _allPeers: RoomParameters["peers"] | null;

  constructor({
    roomId,
    routers,
    audioObservers,
    mediasoupWorkers,
    peers,
    consumerReplicas,
  }: RoomParameters) {
    logger.log('Room constructor() [roomId:"%s"]', roomId);
    super();
    this._id = uuid(); // TODO: generate room id
    this._roomId = roomId;
    this._locked = false;
    this._closed = false;
    this._peers = new Map();
    this._allPeers = peers;
    this._queue = new AwaitQueue();
    this._mediasoupWorkers = mediasoupWorkers;
    this._routers = routers;
    this._audioObservers = audioObservers;
  }

  // create room and returns instance of Room
  static async create({
    mediasoupWorker: worker,
    consumerReplicas,
    roomId,
    peers,
  }: RoomCreateParameters): Promise<Room> {
    logger.log('Room.create() [roomId:"%s"]', roomId);

    let routers: Routers = new Map(); // TODO: create router class
    let audioObservers: AudioObservers = new Map(); // TODO: create audio level observer class
    // let audioLevelObservers: types.AudioLevelObserver[] = []; //TODO: create audio level observer class

      // Creating only one router per worker since there is no need for multiple
      const router = await worker.createRouter({ mediaCodecs });
      routers.set(router.id, router);

      const audioLevelObserver = await router.createAudioLevelObserver(
        config.mediasoup.router.audioLevelObserver
      );
      audioObservers.set(router.id, {
        audioLevelObserver,
        volume: -1000,
        peerId: null,
      });

      const activeSpeakerObserver = await router.createActiveSpeakerObserver();

    return new Room({
      roomId,
      webrtcServer: worker.appData.webRtcServer as types.WebRtcServer,
      routers,
      audioObservers,
      consumerReplicas,
    });
  }
  // join room
  // leave room
  // close room
  close() {
    logger.log('Room.close() [roomId:"%s"]', this._roomId);
    this._closed = true;
    if (!this._queue) {
      logger.warn(
        'Room.close() | room already closed [roomId:"%s"]',
        this._roomId
      );
      return;
    }
    this._queue?.stop(); // TODO: verify this
    this._queue = null; // TODO: verify this

    // close all peers
    for (const peer of this._peers.values()) {
      if (!peer.isClosed) {
        peer.close();
      }
    }

    for (const router of this._routers.values()) {
      logger.log('Room.close() | closing router [routerId:"%s"]', router.id);
      this._audioObservers.get(router.id)?.audioLevelObserver?.close();
      this._audioObservers
        .get(router.id)
        ?.audioLevelObserver?.removeAllListeners();
      this._audioObservers.delete(router.id);
      router.close();
    }

    this._peers.clear();
    this._allPeers?.clear();
    this._mediasoupWorkers = []; // TODO: should I close all workers?
    this._audioObservers.clear();
    this._routers.clear();

    // TODO: clear tokens after closing room

    this.emit("close");
  }
  // log status
  log() {
    logger.log(
      'Room.log() [roomId:"%s", peersCount: %s]',
      this._roomId,
      Object.keys(this?._peers).length
    );
  }
  // get room
  // get rooms
  // handler peer request
  handlePeer({ peer, allowed }: { peer: Peer; allowed: boolean }) {
    logger.log(
      'Room.handlePeer() [peerId:"%s", roles: "%s", returning: "%s"]',
      peer.id,
      peer.roles,
      allowed
    );

    if (this.isClosed()) {
      throw new Error("Room closed");
    }

    // dont allow already existing peers
    if (this._peers.has(peer.id)) {
      logger.warn(
        'Room.handlePeer() | there is already a peer with same peerId [peerId:"%s"]',
        peer.id
      );
    }

    if (allowed) return handlers.joinPeer(peer, true);

    if (this._peers.size >= config.maxUsersPerRoom)
      return handlers.handleRoomOverLimit(peer);

    // TODO: handle connection request

    handlers.handleGuestPeer({ peer });
  }

  isClosed() {
    return this._closed;
  }

  isLocked() {
    return this._locked;
  }

  //----
  // createRoom({roomID})

}
