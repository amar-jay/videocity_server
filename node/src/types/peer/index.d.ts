import { Consumer, Producer, Transport } from "mediasoup/lib/types";
import { WebSocket } from "ws";

// TODO: set to this later
type OtherPeer = {
  sendTransport?: Transport;
  recvTransport?: Transport;
  producer?: Producer;
  consumers: Map<string, Consumer>;
};
interface MyPeer extends OtherPeer {
  id: string;
  picture?: string;
  displayName?: string;
  email?: string;
  roles?: unknown[];
  roomId: string;
  socket: WebSocket;
  rtpCapabilities?: types.RtpCapabilities;
  allowed?: boolean;
}
