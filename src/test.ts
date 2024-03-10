import { ethers } from "ethers";
import config from "./config";
import { findLatestBlock } from "./database/raws";
import { batchRequest } from "./utils";

async function main() {
    const provider = new ethers.JsonRpcProvider(config.alternativeRpcUrl);
    console.log(await provider.getLogs({ fromBlock: 32793, toBlock: 32803 }))
}

main();
