type WsRequest<T extends unknown> = {
	  event: string;
	  data: T;
}

type MediasoupWorkers = {
	worker: mediasoup.types.Worker;
	router: mediasoup.types.Router | null;
  }[]