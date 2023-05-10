import WebSocket, { RawData } from "ws";
import logger from "./logger";

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
export const clone = <T, V>(obj: T, defaultValue: V): T | V => {
  return obj ? JSON.parse(JSON.stringify(obj)) : defaultValue;
};
