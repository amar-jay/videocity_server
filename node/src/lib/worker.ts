import * as mediasoup from 'mediasoup';
import { config } from './config';
import logger from './logger';

let mediasoupWorkers:Map<number,{
    worker: mediasoup.types.Worker;
    router: mediasoup.types.Router | null;
}> = new Map();
/**
 * Launch mediasoup workers as specified in configuration file.
 */
export async function startMediasoup(): Promise<mediasoup.types.Router>{
    const { numWorkers } = config.mediasoup;

    const rtpCapabilities = mediasoup.getSupportedRtpCapabilities();
    rtpCapabilities.codecs = rtpCapabilities.codecs?.filter((codec) => {
        return codec.kind === 'audio' || codec.kind === 'video';
    });

    rtpCapabilities.headerExtensions = rtpCapabilities.headerExtensions?.filter((ext) => {
        return ext.kind === 'audio' || ext.kind === 'video';
    });


	mediasoup.observer.on('newworker', (worker) => {
		logger.log('new worker created [worket.pid:%d]', worker.pid);

		worker.observer.on('close', () => {
			logger.log('worker closed [worker.pid:%d]', worker.pid);
		});

		worker.observer.on('newrouter', (router) => {
			logger.log('new router created [worker.pid:%d, router.id:%s]', worker.pid, router.id);
			worker.observer.on('close', () => {
				logger.log('router closed [worker.pid:%d, router.pid:%d]', worker.pid, router.id);
			});

		});
	});

    // logger.log('- mediasoup rtpCapabilities:', rtpCapabilities);
    logger.log('Mediasoup: creating %d workers...', config.mediasoup.numWorkers);
    const { logLevel, logTags, rtcMinPort, rtcMaxPort } = config.mediasoup.worker;
    const { mediaCodecs } = config.mediasoup.router;
    const worker = await mediasoup.createWorker({
        logLevel,
        logTags,
        rtcMinPort,
        rtcMaxPort,

    });

    worker.on('died', () => {
        logger.error('mediasoup worker died, exiting in 2 seconds... [pid:%d]', worker.pid);
        setTimeout(() => process.exit(1), 2000);
    });

    const router = await worker.createRouter({ mediaCodecs });
    mediasoupWorkers.set(worker.pid, {worker, router});


    return router;
}
