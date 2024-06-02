import { BulkJobOptions, Job, Worker } from "bullmq";
import config from "../config";
import { ethers } from "ethers";
import {
    nameOfqueueTx,
    batchRequestTransactionReceipt,
    wait,
    queueErc20,
    batchRequestTransaction,
} from "../utils";
import { IBlock, ILogs, ITransactions } from "../types";
import { insertTransaction } from "../clickhouse/transactions";
import { insertLog } from "../clickhouse/logEvents";

const worker = new Worker(
    nameOfqueueTx,
    async (job: Job<{ transactions: string[]; dataBlocks: IBlock[] }>) => {
        try {
            const provider = new ethers.JsonRpcProvider(config.rpcUrl);

            const listTransactionsReceipts = (await Promise.race([
                wait(5000),
                batchRequestTransactionReceipt(
                    job.data.transactions,
                    provider
                ).catch((err) => {
                    throw new Error(err);
                }),
            ])) as ethers.TransactionReceipt[];

            const listTransactions = (await Promise.race([
                wait(5000),
                batchRequestTransaction(job.data.transactions, provider).catch(
                    (err) => {
                        throw new Error(err);
                    }
                ),
            ])) as ethers.Transaction[];

            const log_raws: ILogs[] = [];
            const listDeployedContract: string[] = [];

            const tx_raws: ITransactions[] = listTransactionsReceipts.map(
                (item) => {
                    const timestamp = job.data.dataBlocks.filter(
                        (x) => x.block_number === item.blockNumber
                    )[0].timestamp;
                    const log: ILogs[] = item.logs.map((x) => {
                        return {
                            address: x.address.toLowerCase(),
                            block_hash: x.blockHash.toLowerCase(),
                            block_number: x.blockNumber,
                            data: x.data.toLowerCase(),
                            index: x.index,
                            timestamp: timestamp,
                            topics: x.topics,
                            transaction_hash: x.transactionHash.toLowerCase(),
                            transaction_index: x.transactionIndex,
                        };
                    });
                    log_raws.push(...log);
                    if (item.contractAddress)
                        listDeployedContract.push(item.contractAddress);
                    const valueRaw = listTransactions.filter(
                        (y) => y.hash.toLowerCase() === item.hash.toLowerCase()
                    );
                    let value = 0;
                    if (valueRaw.length === 0)
                        throw new Error("value not found");
                    else value = Number(valueRaw[0].value);
                    return {
                        blob_gas_price: item.blobGasPrice
                            ? Number(item.blobGasPrice)
                            : null,
                        blob_gas_used: item.blobGasUsed
                            ? Number(item.blobGasUsed)
                            : null,
                        block_hash: item.blockHash.toLowerCase(),
                        block_number: item.blockNumber,
                        contract_address: item.contractAddress
                            ? item.contractAddress.toLowerCase()
                            : null,
                        cummulative_gas_used: Number(item.cumulativeGasUsed),
                        from_address: item.from.toLowerCase(),
                        gas_price: item.gasPrice ? Number(item.gasPrice) : null,
                        gas_used: Number(item.gasUsed),
                        index: item.index,
                        logsbloom: item.logsBloom,
                        root: item.root,
                        status: item.status ?? item.status === 1,
                        timestamp: timestamp,
                        to_address: item.to ? item.to.toLowerCase() : null,
                        transaction_hash: item.hash.toLowerCase(),
                        type: item.type,
                        value: value,
                    };
                }
            );

            await insertTransaction(tx_raws);
            await insertLog(log_raws);
            if (listDeployedContract.length > 0) {
                const queueJobs: {
                    name: string;
                    data: any;
                    opts?: BulkJobOptions;
                }[] = listDeployedContract.map((x, index) => {
                    return {
                        name: x,
                        data: { contract_address: x },
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
                queueErc20.addBulk(queueJobs);
            }

            console.log("done added logs and tx at ", new Date());
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
