import { Job, Queue, Worker } from "bullmq";
import config from "../config";
import { ethers } from "ethers";
import { Raws, queueName } from "../types";
import { findLatestBlock, insertRaws } from "../database/raws";
import { batchRequest } from "../utils";

const worker = new Worker(
    queueName,
    async (job: Job<{ blockRange: number }>) => {
        try {
            const provider = new ethers.JsonRpcProvider(
                config.alternativeRpcUrl
            );
            const alternativeProvider = new ethers.JsonRpcProvider(
                config.rpcUrl
            );

            // get latest block check
            const lastCheckBlock =
                Number((await findLatestBlock())?.[0]?.block_number) + 1 || 1;
            const latestBlock = await provider.getBlockNumber();
            const endBlock = Math.min(lastCheckBlock + job.data.blockRange, latestBlock);
            if(lastCheckBlock > endBlock) return;
    
            // query data
            const raws = await provider.getLogs({
                fromBlock: lastCheckBlock,
                toBlock:
                    endBlock
            });

            const blockDetails = await batchRequest(
                lastCheckBlock,
                endBlock,
                alternativeProvider
            );

            const params: Raws[] = raws.map((item) => {
                return {
                    address: item.address,
                    block_hash: item.blockHash,
                    block_number: item.blockNumber,
                    data: item.data,
                    timestamp: blockDetails.filter(
                        (x) => x.number === item.blockNumber
                    )[0].timestamp,
                    topics: item.topics,
                    transaction_index: item.transactionIndex,
                    tx_hash: item.transactionHash,
                };
            });

            await insertRaws(params);
            console.log("success insert new blocks until => ", endBlock )
        } catch (error) {
            throw error;
        }
    },
    {
        connection: config.redisConnection,
        autorun: false,
        concurrency: config.workerConfig.concurrency,
        limiter: {
            max: 1,
            duration: 1000,
        },
    }
);

worker.run();
