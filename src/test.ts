import { ethers } from "ethers";
import config from "./config";
import { batchRequest } from "./utils";

async function main() {
    const provider = new ethers.JsonRpcProvider(config.rpcUrl);
    const data = await batchRequest(1, 100, provider);
    console.log(data[0]);
}

main();