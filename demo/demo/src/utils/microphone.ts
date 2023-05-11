
export const enableMicrophone = async () => {
	console.log("enableMicrophone called");
	const audio = document.querySelector("#localAudio") as HTMLAudioElement;
	const video = document.querySelector("#localVideo") as HTMLVideoElement;

	if (audio === null || video === null) {
		return;
	}

	audio.srcObject = await navigator.mediaDevices.getUserMedia({ audio: true});
	audio.onloadedmetadata = () => {
		audio.play();
	};
	let track: MediaStreamTrack | null = null;
	await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
	.then((stream) => {
		video.srcObject = stream;
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

export const disableMicrophone = async () => {
	console.log("not implemented")
}