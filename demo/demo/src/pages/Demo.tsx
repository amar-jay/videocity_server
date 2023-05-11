import { useCallback, useEffect, useState } from "react";
import { enableMediaStream, disableMediaStream } from "../utils/microphone";
import { Video } from "../components/video";
import {deviceInfo} from "../utils/deviceInfo";
// import * as Mediasoup from "mediasoup-client";

export function Demo () {
  const [devices, setDevices] = useState<string>();
  useEffect(() => {
    // const device = new Mediasoup.Device();
    async function menu() {
    // enableMediaStream("#localVideo", {audio: true, video: true});
    const devices = navigator.mediaDevices.enumerateDevices(); // TODO: how to get media devices?
    setDevices(JSON.stringify(devices, null, 2));

    }
    menu();
  }, [setDevices]);

  const startStream = useCallback(() => {
	const run = async () => {
	enableMediaStream("#localVideo", {audio: true, video: true});
	}
	run();
}
	, []);
  const stopStream = useCallback(() => {
	const run = async () => {
	disableMediaStream("#localVideo");
	}
	run();
}
	, []);
	return (
		<div className="">
		<h1>
			Video<span>City</span>
		</h1>
		<div>
			<div style={{alignItems: 'center', justifyContent: 'center', display: 'flex', marginBottom: '1rem', gap: '.5rem'}}>
				<button onClick={startStream} className="primaryButton">Start</button>
				<button onClick={stopStream} className="secondaryButton">Stop</button>
			</div>
			<div>
				<Video id="localVideo" />
				<Video id="remoteVideo" />
				<div>{JSON.stringify(deviceInfo())}</div>
				{/* <audio id="localAudio" autoPlay playsInline></audio> */}
				{/* {devices && <pre>{devices}</pre>} */}
			</div>
		</div>
		</div>
	)
}
