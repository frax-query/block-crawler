import { ethers } from "ethers";


export const batchRequest = async (from: number, to: number, provider: ethers.JsonRpcProvider) => {
    const requests = [];
    for(let i = from; i <= to; i++) {
        requests.push(provider.getBlock(i))
    }
    return await Promise.all(requests);
};
