import { RequestEvents } from "@/lib/config";

type WsRequest<T extends unknown> = {
	  event: RequestEvents[keyof RequestEvents];
	  data: T;
}

type MediasoupWorkers = {
	worker: mediasoup.types.Worker;
	router: mediasoup.types.Router | null;
  }[]