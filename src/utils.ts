import { ethers } from "ethers";
import { Queue } from "bullmq";
import config from "./config";

export const nameOfqueueBlock = "queue-blocks";
export const nameOfqueueTx = "queue-tx";
export const nameOfqueueLogs = "queue-logs";
export const nameOfqueueErc20 = "queue-erc20";
export const nameOfQueuePrice = "queue-price";
export const nameOfQueuePriceAPI3 = "queue-price-api3"

export const queueBlock = new Queue(nameOfqueueBlock, {
    connection: config.redisConnection,
});

export const queueTx = new Queue(nameOfqueueTx, {
    connection: config.redisConnection,
});

export const queueLogs = new Queue(nameOfqueueLogs, {
    connection: config.redisConnection,
});

export const queueErc20 = new Queue(nameOfqueueErc20, {
    connection: config.redisConnection,
});

export const queuePrice = new Queue(nameOfQueuePrice, {
    connection: config.redisConnection,
});

export const queuePriceApi3 = new Queue(nameOfQueuePriceAPI3, {
    connection: config.redisConnection,
});

export const batchRequest = async (
    from: number,
    to: number,
    provider: ethers.JsonRpcProvider
) => {
    const requests = [];
    for (let i = from; i <= to; i++) {
        requests.push(provider.getBlock(i));
    }
    return await Promise.all(requests);
};

export const batchRequestTransactionReceipt = async (
    listHash: string[],
    provider: ethers.JsonRpcProvider
) => {
    const requests = [];
    for (let i = 0; i < listHash.length; i++) {
        requests.push(provider.getTransactionReceipt(listHash[i]));
    }
    return await Promise.all(requests);
};

export const batchRequestTransaction = async (
    listHash: string[],
    provider: ethers.JsonRpcProvider
) => {
    const requests = [];
    for (let i = 0; i < listHash.length; i++) {
        requests.push(provider.getTransaction(listHash[i]));
    }
    return await Promise.all(requests);
};

export const wait = (ms: number) => {
    return new Promise((_, reject) => {
        setTimeout(() => reject(new Error("timeout succeeded")), ms);
    });
};

export const splitData = (value: string) => {
    const strippedData = value.slice(2);
    const chunks = strippedData.match(/.{1,64}/g).map((chunk) => "0x" + chunk);
    return chunks;
};
