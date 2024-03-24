import { Job, Worker } from "bullmq";
import config from "../config";
import { ethers } from "ethers";
import { getTokens, updateToken } from "../database/token_tracker";
import erc20_abi from "../abis/erc20.json";
import { insertErc20 } from "../database/erc20";
import { NewErc20 } from "index";

const worker = new Worker(
    config.queueNameErc20,
    async (job: Job<{ blockRange: number }>) => {
        try {
            const provider = new ethers.JsonRpcProvider(
                config.alternativeRpcUrl2
            );

            const token = await getTokens();

            if (!!!token?.token_address) {
                return;
            }

            const contract = new ethers.Contract(
                token?.token_address,
                erc20_abi,
                provider
            );
            const paramErc20: NewErc20[] = [];

            await Promise.allSettled([
                contract.name(),
                contract.symbol(),
                contract.decimals(),
            ]).then((data) => {
                if (!data.some((item) => item.status === "rejected")) {
                    paramErc20.push({
                        // @ts-ignore
                        decimals: data[2].value,
                        // @ts-ignore
                        name: data[0].value,
                        // @ts-ignore
                        symbol: data[1].value,
                        token_address: token?.token_address.toLowerCase(),
                    });
                }
            });

            await insertErc20(paramErc20);
            await updateToken(token?.token_address);
            console.log(
                "success add erc20 token ",
                token?.token_address,
                " ",
                paramErc20[0].name,
                " ",
                paramErc20[0].symbol,
                " ",
                paramErc20[0].decimals
            );
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    {
        connection: config.redisConnection,
        autorun: false,
        concurrency: config.workerConfig.concurrency,
        limiter: {
            max: 1,
            duration: 1000,
        },
    }
);

worker.run();
