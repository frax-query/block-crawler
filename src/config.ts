export default {
    databaseConfig: {
        database: "mode_mainnet",
        host: "localhost",
        user: "postgres",
        password: "akbaridria",
        port: 5433,
    },
    redisConnection: {
        host: "localhost",
        port: 6379,
    },
    queueConfig: {
        attemps: Number.MAX_SAFE_INTEGER,
        repeat: { every: 10000 },
        removeOnFail: false,
        removeOnComplete: true,
    },
    workerConfig: {
        concurrency: 1,
    },
    rpcUrl: "https://mantle-rpc.publicnode.com",
    alternativeRpcUrl: "https://rpc.mantle.xyz",
    blockRange: 300
}