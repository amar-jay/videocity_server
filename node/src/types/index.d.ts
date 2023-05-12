type WsRequest<T extends unknown> = {
	  event: string;
	  data: T;
}
