import "dotenv/config";

export default {
    databaseConfig: {
        database: process.env.DATABASE_NAME,
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        port: Number(process.env.DATABASE_PORT),
    },
    redisConnection: {
        host: process.env.REDIS_HOST as string,
        port: Number(process.env.REDIS_PORT),
    },
    queueConfig: {
        attemps: 1,
        repeat: { every: 10000 },
        removeOnFail: true,
        removeOnComplete: true,
        backoff: {
            type: "exponential",
            delay: 1000,
        },
    },
    workerConfig: {
        concurrency: 1,
    },
    rpcUrl: process.env.RPC_URL,
    blockRange: 50,
};
