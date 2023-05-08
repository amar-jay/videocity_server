
/**
 * Check if the given data is valid JSON.
 */
export const isValidJSON = <R>(data: any): R | null => {
  let message:R = {} as R;
  if (data === undefined) {
    return null;
  }

  try {
 message = JSON.parse(data);
  // console.log(data)
  } catch (err) {
    console.error("Error in send: " + err, data);
    return null;
  }
  return message;
}

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
    console.error("Error in send: " + err);
    return;
  }

  ws.send(message);
}


/**
 * Error wrapper for send.
 */
export const sendError = (error: string, ws: WebSocket) => {
  send(ws, "error", { type: "error", message: error });
  }

