import Mediasoup from 'mediasoup-client';
const url = 'ws://localhost:8080';
const joinBtn = document.getElementById('join');
const closeBtn = document.getElementById('close');
const roomID = document.getElementById('room_id');
let device; // client device

const messages = {
	type: "getRouterRtpCapabilities"
}
const connect = () => {

	const socket = new WebSocket(url);
	WebSocket.onopen = () => {
		console.log('WebSocket is connected');
		socket.send(JSON.stringify(messages));
	}

	socket.onmessage = (event) => {
		const data = JSON.parse(event.data);
		if (!data) {
			console.error('JSON data is not valid')
			return;
		}

		switch (data.type) {
			case 'getRouterRtpCapabilities':
				getDevice();
				break;
			default:
				console.error('Invalid message');
		}
		console.log(event.data, event.type);
	}

}

const getDevice = async () => {
	try {
		device = new Mediasoup.Device();
		console.log('device', device);
	} catch (error) {
		if (error.name === 'UnsupportedError') {
			console.error('browser not supported');
		}
	}
}

connect();