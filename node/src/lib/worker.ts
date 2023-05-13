import * as mediasoup from "mediasoup";
import { config } from "./config";
import logger from "../utils/logger";
import { set } from "zod";
import { clone } from "../utils";
import { MediasoupWorkers } from "@/types";
import { getRouterRtpCapabilities } from "./room/handlers";
//import { workerData } from "worker_threads";

export let mediasoupWorkers: MediasoupWorkers = [];
const webRtcServers = new Map<string, mediasoup.types.WebRtcServer>();
const webRtcWorkers = new Map<number, mediasoup.types.Worker>();
const webRtcRouters = new Map<string, mediasoup.types.Router>();
const webRtcTransports = new Map<string, mediasoup.types.Transport>();
const webRtcProducers = new Map<string, mediasoup.types.Producer>();
const webRtcConsumers = new Map<string, mediasoup.types.Consumer>();
const webRtcDataProducers = new Map<string, mediasoup.types.DataProducer>();
const webRtcDataConsumers = new Map<string, mediasoup.types.DataConsumer>();

declare global {
  var worker: mediasoup.types.Worker;
  var webRtcServer: mediasoup.types.WebRtcServer;
  var router: mediasoup.types.Router;
  var transport: mediasoup.types.Transport;
  var producer: mediasoup.types.Producer;
  var consumer: mediasoup.types.Consumer;
  var dataProducer: mediasoup.types.DataProducer;
  var dataConsumer: mediasoup.types.DataConsumer;
}

/**
 * This contains all the observers for all mediasoup events.
 */
function mediasoupObservers() {
  // --- Observers
  mediasoup.observer.on("newworker", (worker) => {
    logger.log("\t- new worker created [worker.pid: %d]", worker.pid);
    webRtcWorkers.set(worker.pid, worker);
    global.worker = worker;

    worker.observer.on("close", () => {
      logger.log("worker closed [worker.pid: %d]", worker.pid);
      webRtcWorkers.delete(worker.pid);
    });
    worker.observer.on("newwebrtcserver", (webRtcServer) => {
      // Store the latest webRtcServer in a global variable.
      global.webRtcServer = webRtcServer;

      webRtcServers.set(webRtcServer.id, webRtcServer);
      webRtcServer.observer.on("close", () =>
        webRtcServers.delete(webRtcServer.id)
      );
    });

    worker.observer.on("newrouter", (router) => {
      logger.log(
        "\t- new router created [worker.pid: %d, router.id:%s]",
        worker.pid,
        router.id
      );
      global.router = router;

      webRtcRouters.set(router.id, router);

      router.observer.on("close", () => {
        logger.log(
          "router closed [worker.pid: %d, router.pid: %d]",
          worker.pid,
          router.id
        );
        webRtcRouters.delete(router.id);
      });

      router.observer.on("newtransport", (transport) => {
        logger.log(
          "\t- new transport created [worker.pid: %d, router.id:%s, transport.id:%s]",
          worker.pid,
          router.id,
          transport.id
        );

        global.transport = transport;
        webRtcTransports.set(transport.id, transport);

        transport.observer.on("close", () => {
          logger.log(
            "transport closed [worker.pid: %d, router.id:%s, transport.id:%s]",
            worker.pid,
            router.id,
            transport.id
          );
          webRtcTransports.delete(transport.id);
        });
        transport.observer.on("newproducer", (producer) => {
          logger.log(
            "\t- new producer created [worker.pid: %d, router.id:%s, transport.id:%s, producer.id:%s]",
            worker.pid,
            router.id,
            transport.id,
            producer.id
          );
          global.producer = producer;
          webRtcProducers.set(producer.id, producer);
          producer.observer.on("close", () => {
            logger.log(
              "producer closed [worker.pid: %d, router.id:%s, transport.id:%s, producer.id:%s]",
              worker.pid,
              router.id,
              transport.id,
              producer.id
            );
            webRtcProducers.delete(producer.id);
          });
        });
        transport.observer.on("newconsumer", (consumer) => {
          logger.log(
            "\t- new consumer created [worker.pid: %d, router.id:%s, transport.id:%s, producer.id:%s]",
            worker.pid,
            router.id,
            transport.id,
            consumer.id
          );
          global.consumer = consumer;
          webRtcConsumers.set(consumer.id, consumer);
          producer.observer.on("close", () => {
            logger.log(
              "consumer closed [worker.pid: %d, router.id:%s, transport.id:%s, consumer.id:%s]",
              worker.pid,
              router.id,
              transport.id,
              consumer.id
            );
            webRtcConsumers.delete(consumer.id);
          });
        });
        transport.observer.on("newdataproducer", (dataProducer) => {
          logger.log(
            "\t- new data consumer created [worker.pid: %d, router.id:%s, transport.id:%s, producer.id:%s]",
            worker.pid,
            router.id,
            transport.id,
            dataProducer.id
          );
          global.dataProducer = dataProducer;
          webRtcDataProducers.set(dataProducer.id, dataProducer);
          producer.observer.on("close", () => {
            logger.log(
              "data consumer closed [worker.pid: %d, router.id:%s, transport.id:%s, dataProducer.id:%s]",
              worker.pid,
              router.id,
              transport.id,
              dataProducer.id
            );
            webRtcConsumers.delete(dataConsumer.id);
          });
        });
        transport.observer.on("newdataconsumer", (dataConsumer) => {
          logger.log(
            "\t- new data consumer created [worker.pid: %d, router.id:%s, transport.id:%s, dataConsumer.id:%s]",
            worker.pid,
            router.id,
            transport.id,
            dataConsumer.id
          );
          global.dataConsumer = dataConsumer;
          webRtcDataConsumers.set(dataConsumer.id, dataConsumer);
          producer.observer.on("close", () => {
            logger.log(
              "data consumer closed [worker.pid: %d, router.id:%s, transport.id:%s, dataConsumer.id:%s]",
              worker.pid,
              router.id,
              transport.id,
              dataConsumer.id
            );
            webRtcConsumers.delete(dataConsumer.id);
          });
        });
      });
    });
  });
}
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

  mediasoupObservers();

  // logger.log('- mediasoup rtpCapabilities:', rtpCapabilities);
  const {
    webRtcTransport: webRtcTransportOptions,
    webRtcServer: webRtcServerOptions,
  } = config.mediasoup;
  const { logLevel, logTags, rtcMinPort, rtcMaxPort } = config.mediasoup.worker;
  const { mediaCodecs } = config.mediasoup.router;

  logger.log("mediasoup: creating %d workers...", config.mediasoup.numWorkers);
  for (let i = 0; i < numWorkers; i++) {
    const worker = await mediasoup.createWorker(config.mediasoup.worker);

    worker.on("died", () => {
      logger.error(
        "mediasoup worker died, exiting in 2 seconds... [pid: %d]",
        worker.pid
      );
      setTimeout(() => process.exit(1), 2000);
    });

    const router = await worker.createRouter({ mediaCodecs });
    mediasoupWorkers.push({ worker, router });

    //TODO: Create Webrtc Server in this worker
    // So each have its own independent port
    const serverOptions = clone(webRtcServerOptions);
    serverOptions.listenInfos = serverOptions.listenInfos.map((listenInfo) => {
      listenInfo.port = listenInfo.port + i;
      return listenInfo;
    });
    // TODO: Set port
    await worker.createWebRtcServer(serverOptions).then((server) => {
      logger.log(
        "\t- new server created [worker.pid: %d, server.id: %s]",
        worker.pid,
        server.id
      );
      worker.appData.server = server;
    });

    // TODO: Log resource usage
    setInterval(async () => {
      const usage = await worker.getResourceUsage();
      logger.info(
        "- mediasoup worker resource usage [pid: %d]: %o",
        worker.pid,
        usage
      );
    }, 60 * 60 * 60 * 24); // every 24 hours
  }

  return mediasoupWorkers;
}
