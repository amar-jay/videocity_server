import zod from "zod";

const envSchema = zod.object({
  NODE_ENV: zod
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: zod.string().default("3000"),
  REDIS_HOST: zod.string().default("localhost"),
  REDIS_PORT: zod.string().default("6379"),
  REDIS_PASSWORD: zod.string().default(""),
  REDIS_DB: zod.string().default("0"),
  REDIS_TLS: zod.boolean().default(false),

  MEDIASOUP_LISTEN_IP: zod.string().default("5000"),
  MEDIASOUP_MIN_PORT: zod.string().default("10000"),
  MEDIASOUP_MAX_PORT: zod.string().default("10100"),
  MEDIASOUP_LOG_LEVEL: zod
    .enum(["debug", "warn", "error", "none"])
    .default("warn"),
  MEDIASOUP_LOG_TAGS: zod.string().default("info,ice,dtls,rtp,srtp,rtcp"),
  MEDIASOUP_NUM_WORKERS: zod.string().default("1"),
  MEDIASOUP_WORKER_BIN: zod
    .string()
    .default("node_modules/mediasoup/bin/mediasoup-worker"),
  MEDIASOUP_ROUTER_BIN: zod
    .string()
    .default("node_modules/mediasoup/bin/mediasoup-router"),
  MEDIASOUP_ANNOUNCED_IP: zod.string().ip().min(7).max(15).default("127.0.0.1"),
});

export type Env = zod.infer<typeof envSchema>;

export const env = envSchema.parse(process.env);

export const isDev = env.NODE_ENV === "development";

export const isProd = env.NODE_ENV === "production";

export default env;
