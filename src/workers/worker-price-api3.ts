import { Job, Worker } from "bullmq";
import config from "../config";
import { ethers } from "ethers";
import { nameOfQueuePriceAPI3, queuePriceApi3, splitData } from "../utils";
import { insertPrice } from "../clickhouse/price";
import { IJobPriceAPI3 } from "../types";

const worker = new Worker(
    nameOfQueuePriceAPI3,
    async (job: Job<IJobPriceAPI3>) => {
        try {
            const rpc = job.data.rpc ?? config.rpcUrl;
            const provider = new ethers.JsonRpcProvider(rpc);
            const latestBlock = Number(await provider.getBlockNumber());
            const endBlock = job.data.startBlock + job.data.blockRange;

            if (job.data.startBlock > latestBlock) {
                queuePriceApi3.add(
                    "queue-price-api3-" +
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

            const res = await provider.getLogs({
                address: job.data.contractAddress,
                fromBlock: job.data.startBlock,
                toBlock: endBlock,
                topics: [job.data.topics0, job.data.dataFeedId],
            });

            await insertPrice(
                res.map((item) => {
                    const [priceRaw, timestampRaw] = splitData(item.data);
                    const price =
                        Number(BigInt(priceRaw)) /
                        Math.pow(10, job.data.decimals);
                    const timestamp = Number(BigInt(timestampRaw));
                    return {
                        name: job.data.tokenName,
                        token_address: job.data.tokenAddress,
                        price: price,
                        source: "api3",
                        symbol: job.data.symbol,
                        timestamp: timestamp,
                    };
                })
            );

            queuePriceApi3.add(
                `queue-price-api3-` +
                    endBlock +
                    1 +
                    "-" +
                    endBlock +
                    job.data.blockRange,
                {
                    ...job.data,
                    startBlock: endBlock + 1,
                },
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