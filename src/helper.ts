import { BulkJobOptions } from "bullmq";
import redis_data3 from "./redis_data3.json";
import { queueTx } from "./utils";

function main() {
    const queueJobs: {
        name: string;
        data: any;
        opts?: BulkJobOptions;
    }[] = redis_data3.map((x, index) => {
        return {
            name: `redis-data3-index-${index}`,
            data: { transactions: x.transactions, dataBlocks: x.dataBlocks },
            opts: {
                attempts: Number.MAX_SAFE_INTEGER,
                backoff: {
                    type: "exponential",
                    delay: 1000,
                },
                removeOnComplete: true,
                removeOnFail: false,
                delay: 5000 * (index + 1),
            },
        };
    });
    queueTx.addBulk(queueJobs);
}

main();