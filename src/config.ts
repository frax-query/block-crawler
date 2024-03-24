import 'dotenv/config'

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
        attemps: Number.MAX_SAFE_INTEGER,
        repeat: { every: 2000 },
        removeOnFail: false,
        removeOnComplete: true,
    },
    workerConfig: {
        concurrency: 1,
    },
    rpcUrl: process.env.RPC_URL,
    alternativeRpcUrl: process.env.RPC_URL_ALTERNATIVE,
    alternativeRpcUrl2: process.env.RPC_URL_ALTERNATIVE2,
    blockRange: 100,
    queueName: "viction_mainnet",
    queueNameErc20: "viction_mainnet_erc20"
};
