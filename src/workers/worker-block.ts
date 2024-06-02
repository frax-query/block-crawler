import { Job, Worker } from "bullmq";
import config from "../config";
import { ethers } from "ethers";
import {
    batchRequest,
    wait,
    nameOfqueueBlock,
    queueTx,
    queueBlock,
} from "../utils";
import { IBlock } from "index";
import { insertBlock } from "../clickhouse/blocks";
// import { findMaxBlock } from "../clickhouse/logEvents";

const worker = new Worker(
    nameOfqueueBlock,
    async (job: Job<{ from: number; to: number }>) => {
        try {
            const provider = new ethers.JsonRpcProvider(config.rpcUrl);

            const latestBlock = (await Promise.race([
                wait(5000),
                provider.getBlockNumber(),
            ])) as number;

            const endBlock = Math.min(job.data.to, latestBlock);
            const lastCheckBlock = job.data.from;

            if (lastCheckBlock > endBlock) return;

            const blockDetails = (await Promise.race([
                wait(5000),
                batchRequest(lastCheckBlock, endBlock, provider).catch(
                    (err) => {
                        throw new Error(err);
                    }
                ),
            ])) as ethers.Block[];

            const dataBlocks: IBlock[] = blockDetails.map((item) => {
                return {
                    base_fee_per_gas: item.baseFeePerGas
                        ? Number(item.baseFeePerGas)
                        : null,
                    blob_gas_used: item.blobGasUsed
                        ? Number(item.blobGasUsed)
                        : null,
                    block_number: item.number,
                    difficulty: Number(item.difficulty),
                    excess_blob_gas: item.excessBlobGas
                        ? Number(item.excessBlobGas)
                        : null,
                    extra_data: item.extraData.toLowerCase(),
                    gas_limit: Number(item.gasLimit),
                    gas_used: Number(item.gasUsed),
                    miner: item.miner.toLowerCase(),
                    nonce: item.nonce.toLowerCase(),
                    parent_beacon_block_root: item.parentBeaconBlockRoot
                        ? item.parentBeaconBlockRoot.toLowerCase()
                        : null,
                    parent_hash: item.parentHash.toLowerCase(),
                    receipts_root: item.receiptsRoot.toLowerCase(),
                    state_root: item.stateRoot.toLowerCase(),
                    timestamp: item.timestamp,
                    transaction_hash: item.hash.toLowerCase(),
                    transactions: item.transactions,
                };
            });

            await insertBlock(dataBlocks);

            // insert block
            queueBlock.add(
                `block-${endBlock + 1}-${endBlock + config.blockRange}`,
                { from: endBlock + 1, to: endBlock + config.blockRange },
                {
                    attempts: Number.MAX_SAFE_INTEGER,
                    backoff: {
                        type: "exponential",
                        delay: 1000,
                    },
                    removeOnFail: false,
                    removeOnComplete: true,
                    delay: 10000,
                }
            );

            // add job to queue tx
            queueTx.add(
                `tx-${lastCheckBlock}-${endBlock}`,
                {
                    transactions: [].concat(
                        ...dataBlocks.map((item) => item.transactions)
                    ),
                    dataBlocks: dataBlocks,
                },
                {
                    attempts: Number.MAX_SAFE_INTEGER,
                    backoff: {
                        type: "exponential",
                        delay: 1000,
                    },
                    removeOnFail: false,
                    removeOnComplete: true,
                    delay: 10000,
                }
            );

            console.log("done added blocks at ", new Date());
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
