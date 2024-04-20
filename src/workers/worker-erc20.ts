import { Job, Worker } from "bullmq";
import config from "../config";
import { ethers } from "ethers";
import { insertErc20 } from "../clickhouse/erc20";
import erc20_abi from "../abis/erc20.json";
import { Erc20 } from "index";
import {
    getTokenByIsTrackedFalseLimit1,
    updateByToken,
} from "../clickhouse/token_tracker";

const worker = new Worker(
    config.queueNameErc20,
    async (job: Job<{ blockRange: number }>) => {
        try {
            const provider = new ethers.JsonRpcProvider(
                config.alternativeRpcUrl2
            );

            const tokenRaw = await getTokenByIsTrackedFalseLimit1();
            
            if (tokenRaw.length === 0) {
                return;
            }

            const token = tokenRaw[0];

            const contract = new ethers.Contract(
                token?.token_address,
                erc20_abi,
                provider
            );
            const paramErc20: Erc20[] = [];

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
                        token_address: token?.token_address.toLowerCase(),
                    });
                }
            });
            await insertErc20(paramErc20);
            await updateByToken(token?.token_address);
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
