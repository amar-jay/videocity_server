import * as mediasoup from "mediasoup";
import { config } from "./config";
import logger from "./logger";
import { set } from "zod";
import { clone } from "./utils";
import { workerData } from "worker_threads";

let mediasoupWorkers: {
  worker: mediasoup.types.Worker;
  router: mediasoup.types.Router | null;
}[] = [];

// Index of mediasoup worker
let mediasoupWorkerIdx: number = 0;

/**
 * Get next mediasoup worker.
 * Round robin way.
 */
const getNextMediasoupWorker = () => {
  const worker = mediasoupWorkers[mediasoupWorkerIdx].worker;
  mediasoupWorkerIdx = (mediasoupWorkerIdx + 1) % mediasoupWorkers.length;
  return worker;
};

/**
 * Launch mediasoup workers as specified in configuration file.
 */
export async function startMediasoup(): Promise<typeof mediasoupWorkers> {
  const { numWorkers } = config.mediasoup;

  const rtpCapabilities = mediasoup.getSupportedRtpCapabilities();
  rtpCapabilities.codecs = rtpCapabilities.codecs?.filter((codec) => {
    return codec.kind === "audio" || codec.kind === "video";
  });

  rtpCapabilities.headerExtensions = rtpCapabilities.headerExtensions?.filter(
    (ext) => {
      return ext.kind === "audio" || ext.kind === "video";
    }
  );

  mediasoup.observer.on("newworker", (worker) => {
    logger.log("new worker created [worket.pid:%d]", worker.pid);

    worker.observer.on("close", () => {
      logger.log("worker closed [worker.pid:%d]", worker.pid);
    });

    worker.observer.on("newrouter", (router) => {
      logger.log(
        "new router created [worker.pid:%d, router.id:%s]",
        worker.pid,
        router.id
      );
      worker.observer.on("close", () => {
        logger.log(
          "router closed [worker.pid:%d, router.pid:%d]",
          worker.pid,
          router.id
        );
      });
    });
  });

  // logger.log('- mediasoup rtpCapabilities:', rtpCapabilities);
  logger.log("Mediasoup: creating %d workers...", config.mediasoup.numWorkers);
  const {
    webRtcTransport: webRtcTransportOptions,
    webRtcServer: webRtcServerOptions,
  } = config.mediasoup;
  const { logLevel, logTags, rtcMinPort, rtcMaxPort } = config.mediasoup.worker;
  const { mediaCodecs } = config.mediasoup.router;

  for (let i = 0; i < numWorkers; i++) {
    const worker = await mediasoup.createWorker({
      logLevel,
      logTags,
      rtcMinPort,
      rtcMaxPort,
    });

    worker.on("died", () => {
      logger.error(
        "mediasoup worker died, exiting in 2 seconds... [pid:%d]",
        worker.pid
      );
      setTimeout(() => process.exit(1), 2000);
    });

    const router = await worker.createRouter({ mediaCodecs });
    mediasoupWorkers.push({ worker, router });

    //TODO: Create Webrtc Server in this worker
    // So each have its own independent port
    const serverOptions = clone(webRtcServerOptions);
    // TODO: Set port
    const server = await worker.createWebRtcServer(serverOptions);
    workerData.AppData.server = server;

    // TODO: Log resource usage
    setInterval(async () => {
      const usage = await worker.getResourceUsage();
      logger.info(
        "mediasoup worker resource usage [pid:%d]: %o",
        worker.pid,
        usage
      );
    }, 60 * 60 * 24); // every 24 hours
  }

  return mediasoupWorkers;
}
