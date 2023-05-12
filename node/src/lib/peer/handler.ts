import { MyPeer } from "@/types/peer";
import { types } from 'mediasoup'

const closePeer = (state: MyPeer) => {
  state.producer?.close();
  state.recvTransport?.close();
  state.sendTransport?.close();
  state.consumers.forEach(([,c]:[number,types.Consumer]) => c.close());
};

export default { closePeer }