"use client";
import {handleConnectionSocket}  from "./ws"

import { useEffect, useState } from "react";
import "./App.css";
import { isValidJSON, send } from "./utils";
import Index from "./pages/Index";
import { CopyLink } from "./pages/CopyLink";
import { ToastProvider } from "./components/toast";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Demo } from "./pages/Demo";

import { types } from "mediasoup-client";

const events = {
  GET_ROUTER_RTP_CAPABILITIES: "getRouterRtpCapabilities",
};

const _connect = async (device: types.Device) => {
  const url = "ws://127.0.0.1:3000/ws?room_id=1234&peer_id=1234";

  const socket = new WebSocket(url);
  socket.onopen = () => {
    console.log("WebSocket is connected");
    send(socket, events.GET_ROUTER_RTP_CAPABILITIES, device);
  };

  socket.onmessage = async (event) => {
    const res = isValidJSON<{ event: string; data: any }>(event.data);
    if (!res) {
      console.error("JSON data is not valid");
      return;
    }

    switch (res.event) {
      case events.GET_ROUTER_RTP_CAPABILITIES:
        // send(socket, events.GET_ROUTER_RTP_CAPABILITIES, device);
        console.log("SERVER RTP CAPABILITY: ", res.data);
        if (!device.canProduce("video")) {
          console.error("cannot produce video");
          return;
        }


        // const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        // const audioTrack = stream.getAudioTracks()[0];
        // const videoTrack = stream.getVideoTracks()[0];
        // const sendTransport = device.createSendTransport();
        // sendTransport.on('connect', async ({ dtlsParameters }) => {
        //   send(socket, 'connectTransport', { dtlsParameters, transportId: sendTransport.id });
        // });

        // sendTransport.on('produce', async ({ kind, rtpParameters, appData }, callback, errback) => {
        //   try {
        //     const { id } = await send(socket, 'produce', { transportId: sendTransport.id, kind, rtpParameters });
        //     callback({ id });
        //   } catch (err) {
        //     errback(err);
        //   }
        // });

        await device
          .load({ routerRtpCapabilities: res.data })
          .then(() => {
            console.log("Device loaded");
          })
          .catch((err: Error) => {
            console.error("Device failed to load", err);
          });

        break;

      case "error":
        console.error("Event Error (xxx): ", res);
        break;
      default:
        console.error("Invalid event: ", res);
      //				console.error('Invalid message');
    }
    // console.log(event.data, event.type);
  };
};

function App() {
  const [status, setStatus] = useState<
    "connected" | "not-connected" | string | undefined
  >();
  

  //   const getDevice = useCallback(async () => {
  // 	try {
  //     // await device.load({ routerRtpCapabilities: messages });
  //  //   setDevice(device);
  // 		// console.log('device', device);
  // 	} catch (error) {
  // 			console.error('browser not supported', error);
  // 	}
  // }, [setDevice]);

  useEffect(() => {
    handleConnectionSocket().then(() => {
      console.log("protoo connected");
      setStatus("connected");
    });
    // connect(device).then(() => {
    //   console.log("Connected to server");
    //   setStatus("connected");
    // });
  }, []);
  const router = createBrowserRouter([
    {
      path: "/",
      element: (() => <Index status={status} />)(),

    },
    {
      path: "/copy-link",
      element: (() => <CopyLink status={status} />)(),
    },
    {
      path: "/demo",
      element: <Demo/>,
    }
  ]);



  return (
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  )
}

export default App;
