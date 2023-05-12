import { EventEmitter } from "events";
import logger from "../../utils/logger";
import { WebSocket } from "ws";
import { v4 as uuid } from "uuid";
import { types } from "mediasoup";
import { Role, Peer as IPeer } from "@/types/room";

export class Peer extends EventEmitter implements IPeer {
  id: IPeer["id"];
  socket: IPeer["socket"];
  roomId: IPeer["roomId"];
  picture: IPeer["picture"];
  displayName: IPeer["displayName"];
  email: IPeer["email"];
  rtpCapabilities: IPeer["rtpCapabilities"];
  roles: Role[];
  joined: boolean;
  private closed: boolean;
  raisedHand: boolean;
  transports: Map<string, types.Transport> = new Map();
  producers: Map<string, types.Producer> = new Map();
  consumers: Map<string, types.Consumer> = new Map();

  constructor({
    id,
    roomId,
    socket,
    displayName,
    email,
    rtpCapabilities,
  }: IPeer) {
    logger.log("Peer constructor() [peerId:" + id + "]");
    super();
    this.closed = false;
    this.id = uuid();
    // this.authId = id; // not necessary
    this.roles = [];
    this.socket = socket;
    this.roomId = roomId;
    this.displayName = displayName;
    this.email = email;
    this.rtpCapabilities = rtpCapabilities;
    this.raisedHand = false;
    this.transports = new Map();
    this.producers = new Map();
    this.consumers = new Map();
    this.joined = false;

    this.handlePeer();
  }

  private handlePeer() {
    if (!this.socket) {
      logger.error(
        "Peer _handlePeer() | socket is closed [peerId:" + this.id + "]"
      );
      return;
    }
    this.socket.on("disconnect", (event) => {
      logger.log(
        "Peer socket 'disconnect' event [peerId:" + this.id + "], event: %o",
        event
      );
      this.close();
    });
  }

  set addRole(role: Role) {
    this.roles.push(role);
    this.emit("roleChanged", this.roles);
  }

  set removeRole(oldRole: Role) {
    if (this.roles.length === 0) {
      logger.info(
        "Peer removeRole() | [peerId:" + this.id + "] no roles to remove"
      );
      return;
    }

    if (!this.roles.some((role) => role.id === oldRole.id)) {
      logger.info(
        "Peer removeRole() | [peerId:" + this.id + "] role not found"
      );
      return;
    }

    this.roles.filter((role) => role.id !== oldRole.id);
    logger.log("Peer removeRole() [peerId:" + this.id + "] role: %o", oldRole);
    this.emit("roleChanged", this.roles);
  }

  info() {
    return {
      id: this.id,
      displayName: this.displayName,
      email: this.email,
      raisedHand: this.raisedHand,
      roles: this.roles,
    };
  }

  get isClosed() {
    return this.closed;
  }
  close() {
    if (this.closed) {
      return logger.log(
        "Peer close() | [peerId:" + this.id + "] is already closed"
      );
    }
    logger.log("Peer close() [peerId:" + this.id + "]");
    this.closed = true;
  }

  // TODO: check if this is right
  handlePeerReconnection(socket: WebSocket) {
    logger.log("Peer handlePeerReconnection() [peerId:" + this.id + "]");
    this.socket = socket;
    this.closed = false;
    this.handlePeer();
  }
}
