import { Job, Worker } from "bullmq";
import config from "../config";
import { ethers } from "ethers";
import { nameOfQueuePrice, queuePrice } from "../utils";
import { insertPrice } from "../clickhouse/price";

const worker = new Worker(
    nameOfQueuePrice,
    async (
        job: Job<{
            fromBlock: number;
            toBlock: number;
            address: string;
            topics: string;
            name: string;
            symbol: string;
            decimals: number;
        }>
    ) => {
        try {
            const rpc = "https://eth.llamarpc.com";
            const provider = new ethers.JsonRpcProvider(rpc);
            const range = 9000;
            const latestBlock = Number(await provider.getBlockNumber());
            if (job.data.fromBlock > latestBlock) {
                queuePrice.add(
                    `queue-price-${latestBlock}-${latestBlock + range}-${
                        job.data.address
                    }`,
                    {
                        fromBlock: latestBlock,
                        toBlock: latestBlock + range,
                        adress: job.data.address,
                        topics: job.data.topics,
                        name: job.data.name,
                        symbol: job.data.symbol,
                        decimals: job.data.decimals,
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
                return;
            }
            console.log("done ", job.data.address)
            const res = await provider.getLogs({
                address: job.data.address,
                fromBlock: job.data.fromBlock,
                toBlock: job.data.toBlock,
                topics: [job.data.topics, null, null],
            });

            // await insertPrice(res.map((item) => {
            //     return {
            //         name: job.data.name,
            //         price: Number(item.topics[1]) / Math.pow(10, job.data.decimals),
            //         source: "chainlink",
            //         symbol: job.data.symbol,
            //         timestamp: Number(item.data)
            //     }
            // }))
            

            queuePrice.add(
                `queue-price-${job.data.toBlock + 1}-${
                    job.data.toBlock + range
                }-${job.data.address}`,
                {
                    fromBlock: job.data.toBlock + 1,
                    toBlock: job.data.toBlock + range,
                    address: job.data.address,
                    topics: job.data.topics,
                    name: job.data.name,
                    symbol: job.data.symbol,
                    decimals: job.data.decimals,
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

            console.log("done added price: ", job.data.name);
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
