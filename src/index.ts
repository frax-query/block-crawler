import { Queue } from "bullmq";
import { queueName } from "./types";
import config from "./config";

async function main() {
    const queue = new Queue(queueName, { connection : config.redisConnection });
    await queue.add("crawling-data", { blockRange: config.blockRange },  { repeat: { every: config.queueConfig.repeat.every }, removeOnComplete: config.queueConfig.removeOnComplete, removeOnFail: config.queueConfig.removeOnFail} );
}

main()