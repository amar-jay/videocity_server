"use client"
import { useCallback, useEffect, useMemo, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import * as Mediasoup from 'mediasoup-client';
import { isValidJSON, send } from './utils';

const events = {
	GET_ROUTER_RTP_CAPABILITIES: "getRouterRtpCapabilities",
}


const connect = (device: Mediasoup.types.Device) => {
  const url = 'ws://127.0.0.1:3000/ws';

	const socket = new WebSocket(url);
	socket.onopen = () => {
		console.log('WebSocket is connected');
    send(socket, events.GET_ROUTER_RTP_CAPABILITIES, device);
	}

	socket.onmessage = (event) => {
    const data = isValidJSON<{event: string, data: any}>(event.data);
		if (!data) {
			console.error('JSON data is not valid')
			return;
		}

		switch (data.event) {
			case events.GET_ROUTER_RTP_CAPABILITIES:
        // send(socket, events.GET_ROUTER_RTP_CAPABILITIES, device);
        console.log("SERVER RTP CAPABILITY: ", data.data)
				break;

      case 'error':
        console.error(data);
        break;
			default:
        console.error("Invalid event: ", data)
//				console.error('Invalid message');
		}
		// console.log(event.data, event.type);
	}

}

function App() {

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
	const device = new Mediasoup.Device();
    connect(device);
  }, [])



  return (
    <>

      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => null}>
          count is {}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
