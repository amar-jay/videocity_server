import { useEffect, useState } from "react";
import { enableMicrophone } from "../utils/microphone";
import * as Mediasoup from "mediasoup-client";

export function Demo () {
  const [devices, setDevices] = useState<string>();
  useEffect(() => {
    const device = new Mediasoup.Device();
    async function menu() {
    enableMicrophone(device)
    const devices = navigator.mediaDevices.enumerateDevices(); // TODO: how to get media devices?
    setDevices(JSON.stringify(devices, null, 2));

    }
    menu();
  }, [setDevices]);
	return (
		<div className="">
		<h1>
			Video<span>City</span>
		</h1>
		<div>
			<video id="localVideo" autoPlay playsInline></video>
			<audio id="localAudio" autoPlay playsInline></audio>
			{devices && <pre>{devices}</pre>}
		</div>
		</div>
	)
}
