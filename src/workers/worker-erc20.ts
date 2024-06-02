import { Job, Worker } from "bullmq";
import config from "../config";
import { ethers } from "ethers";
import { nameOfqueueErc20 } from "../utils";
import { IERC20 } from "index";
import erc20_abi from "../abis/erc20.json";
import { insertErc20 } from "../clickhouse/erc20";

const worker = new Worker(
    nameOfqueueErc20,
    async (job: Job<{ contract_address: string }>) => {
        try {
            const provider = new ethers.JsonRpcProvider(config.rpcUrl);
            const contract = new ethers.Contract(
                job.data.contract_address,
                erc20_abi,
                provider
            );
            const paramErc20: IERC20[] = [];

            await Promise.allSettled([
                contract.name(),
                contract.symbol(),
                contract.decimals(),
            ]).then((data) => {
                if (!data.some((item) => item.status === "rejected")) {
                    paramErc20.push({
                        // @ts-ignore
                        decimals: Number(data[2].value),
                        // @ts-ignore
                        name: data[0].value,
                        // @ts-ignore
                        symbol: data[1].value,
                        token_address: job.data.contract_address.toLowerCase(),
                    });
                    insertErc20(paramErc20);
                    console.log("done added erc20 at ", new Date());
                }
            });
            console.log("contract address is not an erc20 at ", new Date());
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
