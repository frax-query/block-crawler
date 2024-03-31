import { Job, Worker } from "bullmq";
import config from "../config";
import { ethers } from "ethers";
import { LogEvents, queueName, transactions } from "../types";
import { findLatestBlock, insertRaws } from "../database/raws";
import { batchRequest, batchRequestTransaction, wait } from "../utils";
import { insertTransactions } from "../database/transactions";
import { insertTokenTrackers } from "../database/token_tracker";

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
                Number((await findLatestBlock())?.[0]?.block_number) === 0
                    ? 67896045
                    : Number((await findLatestBlock())?.[0]?.block_number) + 1;
            const latestBlock = (await Promise.race([
                wait(5000),
                alternativeProvider.getBlockNumber(),
            ])) as number;
            const endBlock = Math.min(
                lastCheckBlock + job.data.blockRange,
                latestBlock
            );
            if (lastCheckBlock > endBlock) return;

            // query data
            const raws = (await Promise.race([
                wait(5000),
                provider
                    .getLogs({
                        fromBlock: lastCheckBlock,
                        toBlock: endBlock,
                    })
                    .catch((err) => {
                        throw new Error(err);
                    }),
            ])) as ethers.Log[];

            const blockDetails = (await Promise.race([
                wait(5000),
                batchRequest(lastCheckBlock, endBlock, provider).catch(
                    (err) => {
                        throw new Error(err);
                    }
                ),
            ])) as ethers.Block[];

            const listTransactions = (await Promise.race([
                wait(5000),
                batchRequestTransaction(
                    [].concat(...blockDetails.map((item) => item.transactions)),
                    alternativeProvider
                ).catch((err) => {
                    throw new Error(err);
                }),
            ])) as ethers.TransactionResponse[];

            const paramsTx: transactions[] = listTransactions.filter((x) => x.blockNumber <= endBlock).map((item) => {
                return {
                    block_hash: item.blockHash.toLowerCase(),
                    block_number: item.blockNumber,
                    data: item.data.toLowerCase(),
                    from: item.from.toLowerCase(),
                    gas_limit: Number(item.gasLimit),
                    gas_price: Number(item.gasPrice),
                    index: item.index,
                    max_fee_per_blob_gas: Number(item.maxFeePerBlobGas),
                    max_fee_per_gas: Number(item.maxFeePerGas),
                    max_priority_fee_per_gas: Number(item.maxPriorityFeePerGas),
                    nonce: item.nonce,
                    timestamp: blockDetails.filter(
                        (x) => x.number === item.blockNumber
                    )[0].timestamp,
                    to: item?.to?.toLowerCase() ?? null,
                    tx_hash: item.hash.toLowerCase(),
                    type: item.type,
                    value: Number(item.value),
                };
            });

            const tempParamTokens: string[] = [];

            const params: LogEvents[] = raws.map((item) => {
                if (
                    item.topics[0] ===
                        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef" &&
                    !tempParamTokens.includes(item.address.toLowerCase())
                ) {
                    tempParamTokens.push(item.address.toLowerCase());
                }
                return {
                    address: item.address.toLowerCase(),
                    block_hash: item.blockHash.toLowerCase(),
                    block_number: item.blockNumber,
                    data: item.data.toLowerCase(),
                    timestamp: blockDetails.filter(
                        (x) => x.number === item.blockNumber
                    )[0].timestamp,
                    topics: item.topics.map((item) => item.toLowerCase()),
                    transaction_index: item.transactionIndex,
                    tx_hash: item.transactionHash.toLowerCase(),
                    index: item.index,
                };
            });

            await insertTokenTrackers(
                tempParamTokens.map((item) => {
                    return {
                        token_address: item,
                        is_tracked: false,
                    };
                })
            ).catch((err) => {
                throw new Error(err);
            });
            await insertRaws(params).catch((err) => {
                throw new Error(err);
            });
            await insertTransactions(paramsTx).catch((err) => {
                throw new Error(err);
            });
            console.log(
                "Sync status for viction mainnet",
                ((endBlock / latestBlock) * 100).toFixed(4) + "%"
            );
        } catch (error) {
            console.log(error);
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
