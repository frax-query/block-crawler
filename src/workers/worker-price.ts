import { Job, Worker } from "bullmq";
import config from "../config";
import { ethers } from "ethers";
import { nameOfQueuePrice, queuePrice } from "../utils";
import { insertPrice } from "../clickhouse/price";
import { IJobPriceAPI3 } from "../types";

const worker = new Worker(
    nameOfQueuePrice,
    async (job: Job<IJobPriceAPI3>) => {
        try {
            const provider = new ethers.JsonRpcProvider(job.data.rpc);
            const latestBlock = Number(await provider.getBlockNumber());
            if (job.data.startBlock > latestBlock) {
                queuePrice.add(
                    "queue-price-" +
                        latestBlock +
                        "-" +
                        latestBlock +
                        job.data.blockRange,
                    { ...job.data, startBlock: latestBlock },
                    {
                        attempts: Number.MAX_SAFE_INTEGER,
                        backoff: {
                            type: "exponential",
                            delay: 1000,
                        },
                        removeOnFail: false,
                        removeOnComplete: true,
                    }
                );
                return;
            }
            const endBlock = job.data.startBlock + job.data.blockRange;
            const res = await provider.getLogs({
                address: job.data.contractAddress,
                fromBlock: job.data.startBlock,
                toBlock: endBlock,
                topics: [job.data.topics0],
            });

            await insertPrice(
                res.map((item) => {
                    return {
                        name: job.data.tokenName,
                        price:
                            Number(item.topics[1]) /
                            Math.pow(10, job.data.decimals),
                        source: "chainlink",
                        symbol: job.data.symbol,
                        timestamp: Number(item.data),
                        token_address: job.data.tokenAddress,
                    };
                })
            );

            queuePrice.add(
                "queue-price-" +
                    endBlock +
                    1 +
                    "-" +
                    endBlock +
                    job.data.blockRange,
                { ...job.data, startBlock: endBlock + 1 },
                {
                    attempts: Number.MAX_SAFE_INTEGER,
                    backoff: {
                        type: "exponential",
                        delay: 1000,
                    },
                    removeOnFail: false,
                    removeOnComplete: true,
                }
            );

            console.log("done added price: ", job.data.tokenName);
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    {
        connection: config.redisConnection,
        autorun: false,
    }
);

worker.run();
