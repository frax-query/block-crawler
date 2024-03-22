import { ethers } from "ethers";
import config from "./config";
import { findLatestBlock } from "./database/raws";
import { batchRequest } from "./utils";

function wait(ms: number): Promise<unknown> {
    return new Promise((_, reject) => {
       setTimeout(() => reject(new Error('timeout succeeded')), ms);
    });
 }

async function main() {
    const provider = new ethers.JsonRpcProvider("https://rpc.tomochain.com");
    console.log(await provider.getTransactionReceipt('0x007c5ba019d744c38f7624163767d77058e07d5c5ff6315ffa765ee4bf56fad1'))
    
}

main();
