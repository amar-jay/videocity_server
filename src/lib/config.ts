import env from "../env";
import { WorkerSettings, AppData } from "mediasoup/node/lib/types";
import os from "os";

export const config = {
    redisOptions: {},
    staticFilesCachePeriod: 60 * 100,
    listeningPort: 3000,

    mediasoup: {
        numWorkers: Object.keys(os.cpus()).length,
        logLevel : env.MEDIASOUP_LOG_LEVEL || 'warn',
        worker: {
            logTags: [
                'info',
                'ice',
                'dtls',
                'rtp',
                'srtp',
                'rtcp',
            ],
            rtcMinPort: env.MEDIASOUP_MIN_PORT || 10000,
            rtcMaxPort: env.MEDIASOUP_MAX_PORT || 10100,
        } as WorkerSettings<AppData>,
    } ,


} as const;


export default config;