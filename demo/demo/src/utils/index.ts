interface IUrlFactory {
	host: string;
	port: number;
	roomId: string;
	peerId: string;
	type: "ws" | "wss";
}

export const urlFactory = ({ host, port, roomId, peerId, type }: IUrlFactory) => {

	switch (type) {
		case "ws":
			return `ws://${host}:${port}/?roomId=${roomId}&peerId=${peerId}`;
		case "wss":
			return `wss://${host}:${port}/?roomId=${roomId}&peerId=${peerId}`;
		default:
			throw new Error("Invalid url type");
	}
}