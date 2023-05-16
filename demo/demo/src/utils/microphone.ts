
let LOCAL_STREAM: MediaStream | null = null;
export const getLocalStream = async () => {
	await enableMediaStream("#localVideo", { audio: true, video: true });
	return LOCAL_STREAM;
}
export const enableMediaStream = async (id: `#${string}`, constraints: MediaStreamConstraints) => {
	console.log("enableVideoStream called");
	// const audio = document.querySelector("#localAudio") as HTMLAudioElement;
	const video = document.querySelector(id) as HTMLVideoElement;

	if (video === null) {
		console.error("Video element not found");
		return;
	}

	if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
		console.error("Browser API navigator.mediaDevices.getUserMedia not available");
		return;
	}
	
	// audio.srcObject = await navigator.mediaDevices.getUserMedia({ audio: true});
	// audio.onloadedmetadata = () => {
	// 	audio.play();
	// };
	let track: MediaStreamTrack | null = null;
	await navigator.mediaDevices.getUserMedia(constraints)
	.then((stream) => {
		LOCAL_STREAM = stream;
		video.srcObject = LOCAL_STREAM;
		video.onloadedmetadata = () => {
			video.play();
		};
		track = stream.getAudioTracks()[0];
		console.log("got stream");
		return track;
	});

	// if (!device.canProduce("audio")) {
	// 	console.error("cannot produce audio");
	// 	return;
	// }
}

export const disableMediaStream = async (id: `#${string}`) => {
	const video = document.querySelector(id) as HTMLVideoElement;
	if (video === null) {
		console.error("Video element not found");
		return;
	}
	video.pause();
	if (LOCAL_STREAM === null) {
		console.error("Local stream not found");
		return;
	}
	stopMediaStream(LOCAL_STREAM);
	video.srcObject = null;
	console.log("not implemented")
}

/* This is meant to stop local audio and video tracks */
export const stopMediaStream = async (stream: MediaStream) => {

	const tracks = stream.getTracks();

	if (!tracks) {
		console.error("No tracks found");
		return;
	}

	tracks.forEach((track) => {
		track.stop();
	});
}