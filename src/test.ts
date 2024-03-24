import { ethers } from "ethers";
import config from "./config";
import { findLatestBlock } from "./database/raws";
import { batchRequest } from "./utils";
import erc20 from "./abis/erc20.json";
import { getTokens } from "./database/token_tracker";

function wait(ms: number): Promise<unknown> {
    return new Promise((_, reject) => {
        setTimeout(() => reject(new Error("timeout succeeded")), ms);
    });
}

async function main() {
    const provider = new ethers.JsonRpcProvider("https://rpc.tomochain.com");
    const contractAddress = "0x002f89635b0036461b07c6eaacf664e7c189c06f";
    const contract = new ethers.Contract(contractAddress, erc20, provider);

    await Promise.allSettled([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
    ]).then((data) => {
        if(data.some((item) => item.status === "rejected")) {
            // do remove 
            console.log("do with the token address that not erc20")
            return;
        }
        console.log("ini disini success semua")
        console.log(data)
    });
    // console.log(await getTokens())
}

main();
