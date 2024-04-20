import { ethers } from "ethers";
import config from "./config";
import { findLatestBlock } from "./database/raws";
import { batchRequest } from "./utils";
import erc20 from "./abis/erc20.json";
import { getTokens } from "./database/token_tracker";
import { insertErc20 } from "./clickhouse/erc20";
import { findMaxBlock, insertTx } from "./clickhouse/transactions";

function wait(ms: number): Promise<unknown> {
    return new Promise((_, reject) => {
        setTimeout(() => reject(new Error("timeout succeeded")), ms);
    });
}

async function main() {
    console.log(await findMaxBlock())
}

main();
