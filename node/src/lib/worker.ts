import * as mediasoup from 'mediasoup';
import config from './config';
import logger from './logger';
/**
 * Launch mediasoup workers as specified in configuration file.
 */
export async function runMediasoupWorker() {
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
    const worker = await mediasoup.createWorker(config.mediasoup.worker);

    worker.on('died', () => {
        logger.error('mediasoup worker died, exiting in 2 seconds... [pid:%d]', worker.pid);
        setTimeout(() => process.exit(1), 2000);
    });
}