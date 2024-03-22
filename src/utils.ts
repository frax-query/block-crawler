import { ethers } from "ethers";

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
