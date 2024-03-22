import { Queue } from "bullmq";
import { queueName } from "./types";
import config from "./config";

async function main() {
    const queue = new Queue(queueName, { connection : config.redisConnection });
    await queue.add("viction_mainnet", { blockRange: config.blockRange },  { attempts: 3, repeat: { every: config.queueConfig.repeat.every }, removeOnComplete: config.queueConfig.removeOnComplete, removeOnFail: config.queueConfig.removeOnFail} );
}

main()