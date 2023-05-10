import logger from "../logger";
import { EventEmitter } from "events";
import config from "../config";
import { AwaitQueue } from "awaitqueue";
import { nanoid } from "nanoid";
import handlers from "./handlers";
import type {
  RoomParameters,
  RoomCreateParameters,
  AudioObservers,
  Peer,
  Routers,
} from "./types.d";

const { mediaCodecs } = config.mediasoup.router;
export class Room extends EventEmitter {
  private readonly _roomId: RoomParameters["roomId"];
  /** room nano id */
  private readonly _id: string;

  /** queue */
  private _queue: AwaitQueue;

  /** mediasoup workers map */
  private _mediasoupWorkers: RoomParameters["mediasoupWorkers"];

  /** audio observers map*/
  private _audioObservers: RoomParameters["audioObservers"];

  private _closed: boolean;
  private _peers: RoomParameters["peers"];
  private _routers: RoomParameters["routers"];

  constructor({
    roomId,
    routers,
    audioObservers,
    mediasoupWorkers,
    peers,
  }: RoomParameters) {
    logger.log('Room constructor() [roomId:"%s"]', roomId);
    super();
    this._id = nanoid(); // TODO: generate room id
    this._roomId = roomId;
    this._closed = false;
    this._peers = peers;
    this._queue = new AwaitQueue();
    this._mediasoupWorkers = mediasoupWorkers;
    this._routers = routers;
    this._audioObservers = audioObservers;
  }

  // create room and returns instance of Room
  static async create({
    mediasoupWorkers,
    roomId,
    peers,
  }: RoomCreateParameters): Promise<Room> {
    logger.log('Room.create() [roomId:"%s"]', roomId);

    let routers: Routers = new Map(); // TODO: create router class
    let audioObservers: AudioObservers = new Map(); // TODO: create audio level observer class
    // let audioLevelObservers: types.AudioLevelObserver[] = []; //TODO: create audio level observer class

    for (const worker of mediasoupWorkers.values()) {
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
    }
    return new Room({
      roomId,
      mediasoupWorkers,
      peers,
      routers,
      audioObservers,
    });
  }
  // join room
  // leave room
  // close room
  close() {
    logger.log('Room.close() [roomId:"%s"]', this._roomId);
    this._closed = true;
    // TODO: close all routers, audio level observers, and peers
  }
  // log status
  log() {
    logger.log(
      'Room.log() [roomId:"%s", peersCount: %s]',
      this._roomId,
      Object.keys(this._peers).length
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

    if (this._closed) {
      throw new Error("Room closed");
    }

    // dont allow already existing peers
    if (this._peers.has(peer.id)) {
      logger.warn(
        'Room.handlePeer() | there is already a peer with same peerId [peerId:"%s"]',
        peer.id
      );
    }

    if (allowed) {
      // TODO: handle returning peer
      return;
    }

    handlers.handleGuestPeer({ peer });
  }

  // join peer
  _joinPeer(peer: Peer, allowed?: boolean) {
    if (!allowed) {
      logger.log('Room._joinPeer() | peer not allowed [peerId:"%s"]', peer.id);
      return;
    }
  }
}
