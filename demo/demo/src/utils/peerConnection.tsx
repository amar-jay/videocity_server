export const prepareNewConnection = () => {
	const pcConfig= {
		iceServers: [
			{
				urls: "stun:stun.l.google.com:19302",
			},
		],
	} satisfies RTCConfiguration;

	const pc = new RTCPeerConnection(pcConfig);
	pc.onicecandidate = (event) => {
		console.log("onicecandidate", event);
	}
	pc.oniceconnectionstatechange = (event) => {
		console.log("oniceconnectionstatechange", event);
	}
	pc.onicegatheringstatechange = (event) => {
		console.log("onicegatheringstatechange", event);
	}
	pc.onnegotiationneeded = (event) => {
		console.log("onnegotiationneeded", event);
	}
	pc.onsignalingstatechange = (event) => {
		console.log("onsignalingstatechange", event);
	}
	pc.ontrack = (event) => {
		console.log("ontrack", event);
	}
	return pc;
}
