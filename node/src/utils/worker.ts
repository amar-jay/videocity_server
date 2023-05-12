import { MediasoupWorkers } from "@/types";

// Index of mediasoup worker
let mediasoupWorkerIdx: number = 0;

/**
 * Get next mediasoup worker.
 * Round robin way.
 */
export const getNextMediasoupWorker = (mediasoupWorkers: MediasoupWorkers) => {
  const worker = mediasoupWorkers[mediasoupWorkerIdx].worker;
  mediasoupWorkerIdx = (mediasoupWorkerIdx + 1) % mediasoupWorkers.length;
  return worker;
};

/**
 * create a room given a room id
 */
export function createRoom({ roomid }: { roomid: string }) {}
