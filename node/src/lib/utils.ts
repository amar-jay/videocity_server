import WebSocket, { RawData } from "ws";
import logger from "./logger";
import { networkInterfaces } from "os";
import { isProd } from "@/env";
import { types } from "mediasoup";

/**
 * Check if the given data is valid JSON.
 */
export const isValidJSON = <R>(data: RawData): R | null => {
  let message: R = {} as R;
  if (data === undefined) {
    return null;
  }

  try {
    message = JSON.parse(data.toString());
  } catch (err) {
    logger.error("Error in send: " + err);
    return null;
  }
  return message;
};

/**
 * Parse a given event into JSON and send it through the websocket.
 */
export const send = (ws: WebSocket, event: string, data: any) => {
  if (data === undefined) {
    data = {};
  }
  let message = "";

  try {
    message = JSON.stringify({ event, data });
  } catch (err) {
    logger.error("Error in send: " + err);
    return;
  }

  ws.send(message);
};

/**
 * Error wrapper for send.
 */
export const sendError = (error: string, ws: WebSocket) => {
  send(ws, "error", error);
};

/**
 * Clone an object efficiently else returns default value.
 */
export const clone = <T, V>(obj: T, defaultValue?: V): T => {
  if (obj !== undefined && obj !== null) return JSON.parse(JSON.stringify(obj));
  if (defaultValue !== undefined && defaultValue !== null)
    return JSON.parse(JSON.stringify(defaultValue));

  throw logger.error("clone: invalid defaultValue: " + defaultValue);
};

/***
 * Incredible hack to get all possible ip addresses of the machine.
 *
 */
// add automatic IP detection
const ifaceWhiteListRegex = "^(eth.*)|(enp.*)|(ens.*)|(br.*)|(wl.*)|(ww.*)";
export function getListenIps(): types.TransportListenIp[] {
  const listenIP: types.TransportListenIp[] = [];
  const ifaces = networkInterfaces();

  Object.keys(ifaces).forEach(function (ifname) {
    if (ifname.match(ifaceWhiteListRegex)) {
      ifaces[ifname]?.forEach(function (iface) {
        if (
          (iface.family !== "IPv4" &&
            (iface.family !== "IPv6" || iface.scopeid !== 0)) ||
          (isProd && iface.internal !== false)
        ) {
          // skip over internal (i.e. 127.0.0.1) and non-ipv4 or ipv6 non global addresses
          return;
        }
        listenIP.push({ ip: iface.address, announcedIp: undefined });
      });
    }
  });

  return listenIP;
}
