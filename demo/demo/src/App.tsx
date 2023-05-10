"use client"
import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import * as Mediasoup from 'mediasoup-client';
import { isValidJSON, send } from './utils';

const events = {
	GET_ROUTER_RTP_CAPABILITIES: "getRouterRtpCapabilities",
}


const connect = async (device: Mediasoup.types.Device) => {
  const url = 'ws://127.0.0.1:3000/ws';

	const socket = new WebSocket(url);
	socket.onopen = () => {
		console.log('WebSocket is connected');
    send(socket, events.GET_ROUTER_RTP_CAPABILITIES, device);
	}

	socket.onmessage = async (event) => {
    const data = isValidJSON<{event: string, data: any}>(event.data);
		if (!data) {
			console.error('JSON data is not valid')
			return;
		}

		switch (data.event) {
			case events.GET_ROUTER_RTP_CAPABILITIES:
        // send(socket, events.GET_ROUTER_RTP_CAPABILITIES, device);
        console.log("SERVER RTP CAPABILITY: ", data.data)
        if (!device.canProduce('video')) {
          console.error('cannot produce video');
          return;
        }

        if (!device.canProduce('audio')) {
          console.error('cannot produce audio');
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

        await device.load({ routerRtpCapabilities: data.data }).then(() => {
          console.log("Device loaded")
        }).catch((err) => {
          console.error("Device failed to load", err)
        })

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
  const [errorText, ] = useState<string | null>(null);
  const [status, setStatus] = useState<"connected" | "not-connected" | string | null>(null);

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
    connect(device).then(() => {
      console.log("Connected to server")
      setStatus("connected")
    })
  }, [])



  return (
    <>

      {/* <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div> */}
      <h1>Video<span>City</span></h1>
      <div style={{borderWidth: '5px', borderColor: '#f00000'}}>
      <input type="text" placeholder="Room ID" style={{ paddingLeft: '5px', fontSize: '13px', paddingTop: '10px', paddingBottom: '10px',}} />
      {errorText && <p style={{color: 'red'}}>{errorText}</p> }
        <h3 style={{marginBottom: '1rem', textDecoration: 'underline'}}>Permissions</h3>
        <label htmlFor="video">Video</label>
        <input type="checkbox" id="video" name="video" value="video" />
        <div style={{marginTop: '.5rem'}}/>
        <label htmlFor="audio">Audio</label>
        <input type="checkbox" id="audio" name="audio" value="audio" />
        <div style={{marginTop: '.5rem'}}/>
        <label htmlFor="video">Screen</label>
        <input type="checkbox" id="screen" name="screen" value="screen" />
        <div style={{marginTop: '.5rem'}}/>
      </div>
      <div className="card">
        <button onClick={() => null} disabled={status !== "connected"}>
          Join Room
        </button>
      </div>
      <p className="read-the-docs">
        By amar-jay | <a href="https://github.com/amar-jay" target="_blank">Github</a>
      </p>
    </>
  )
}

export default App
