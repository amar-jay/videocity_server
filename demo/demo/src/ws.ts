import { Device, types } from 'mediasoup-client';
import protooClient from 'protoo-client';
import { getLocalStream } from './utils/microphone';

interface GetProtooUrlOptions {
	roomId: number;
	peerId: number;
	consumerReplicas: number;
}
const protooPort = 4443;
function getProtooUrl({ roomId, peerId, consumerReplicas }: GetProtooUrlOptions)
{
	const hostname = window.location.hostname;

	return `ws://${hostname}:${protooPort}/?roomId=${roomId}&peerId=${peerId}&consumerReplicas=${consumerReplicas}`;
}
const _protooUrl = getProtooUrl({ roomId: 1, peerId: 1, consumerReplicas: 1 });
const protooTransport = new protooClient.WebSocketTransport(_protooUrl);

const protoo = new protooClient.Peer(protooTransport);
protoo.close = () =>
{
	protooTransport.close();
};
const protooPromise = new Promise<protooClient.Peer>((resolve, reject) =>
{
	protoo.on('failed', () => {
		console.log('failed');
	});
	protoo.on('open', () =>
	{
		resolve(protoo);
	});

	protoo.on('failed', () =>
	{
		reject();
		console.log('failed');
	});

	protoo.on('disconnected', () =>
	{
		console.log('disconnected');
	});
});

const device = new Device();
export const handleConnectionSocket = async () => {
	const protoo = await protooPromise;
	const routerRtpCapabilities = await protoo.request('getRouterRtpCapabilities');
	device.load({ routerRtpCapabilities });
	
}

export const handleTransport = async () => {

const stream = await getLocalStream().catch((err) => {
		console.error("getLocalStream failed:", err.message);
	});
	if (!stream) {
		console.error("Local stream not found");
		return;
	}


	interface CreateWebRtcTransportResponse {
		id: string;
		iceParameters: types.IceParameters;
		iceCandidates: types.IceCandidate[];
		dtlsParameters: types.DtlsParameters;
		sctpParameters: types.SctpParameters;
	}
	const transportInfo:CreateWebRtcTransportResponse = await protoo.request('createWebRtcTransport', {
		forceTcp: false,
		producing: true,
		consuming: false,
		sctpCapabilities: null
	})


	const {
		iceParameters,
		iceCandidates,
		dtlsParameters,
		sctpParameters,
	}  = transportInfo;
	console.log(transportInfo);
	const sendTransport = await device.createSendTransport({
		id: transportInfo.id,
		iceParameters,
		iceCandidates,
		dtlsParameters,
		sctpParameters,
	});
	sendTransport.on('connect', ({ dtlsParameters }, callback, errback) => {
		protoo.request('connectWebRtcTransport', {
			transportId: transportInfo.id,
			dtlsParameters
		})
		.then(callback)
		.catch(errback);
	});

	sendTransport.on('produce', async ({ kind, rtpParameters, appData }, callback, errback) => {
		try {
			const { id } = await protoo.request('produce', {
				transportId: transportInfo.id,
				kind,
				rtpParameters,
				appData
			});
			callback({ id });
		} catch (err) {
			errback(err as Error);
		}
	});

	sendTransport.on('producedata', async ({ sctpStreamParameters, label, protocol, appData }, callback, errback) => {
		try {
			const { id } = await protoo.request('produceData', {
				transportId: transportInfo.id,
				sctpStreamParameters,
				label,
				protocol,
				appData
			});
			callback({ id });
		} catch (err) {
			errback(err as Error);
		}
	});

	// JOIN ROOM
	const { peers } = await protoo.request(
		'join',
		{
			displayName     : "Manan",
			device          : device,
			// rtpCapabilities : false 
			// 	? device.rtpCapabilities
			// 	: undefined, // since it is consuming
			// sctpCapabilities : this._useDataChannel && this._consume
			// 	? this._mediasoupDevice.sctpCapabilities
			// 	: undefined
			sctpParameters: sctpParameters,
			rtpCapabilities: device.rtpCapabilities,
		});

	console.log(peers);
}