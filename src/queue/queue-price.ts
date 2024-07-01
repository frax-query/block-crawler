import { IJobPriceAPI3 } from "index";
import { queuePrice } from "../utils";

async function main() {
    const data:IJobPriceAPI3[] = [
        {
            contractAddress: "0xE62B71cf983019BFf55bC83B48601ce8419650CC",
            topics0: "0x0559884fd3a460db3073b7fc896cc77986f16e378210ded43186175bf646fc5f",
            dataFeedId: "",
            symbol: "frxETH",
            tokenName: "frxETH",
            decimals: 8,
            startBlock: 16842888,
            tokenAddress: "0xfc00000000000000000000000000000000000006",
            rpc: "https://eth.llamarpc.com",
            blockRange: 9000
        },
        {
            contractAddress: "0xdBe1941BFbe4410D6865b9b7078e0b49af144D2d",
            topics0: "0x0559884fd3a460db3073b7fc896cc77986f16e378210ded43186175bf646fc5f",
            dataFeedId: "",
            symbol: "BTC",
            tokenName: "Bitcoin",
            decimals: 8,
            startBlock: 16842888,
            blockRange: 9000,
            rpc: "https://eth.llamarpc.com",
            tokenAddress: "0x"
        },
        {
            contractAddress: "0x61eB091ea16A32ea5B880d0b3D09d518c340D750",
            topics0: "0x0559884fd3a460db3073b7fc896cc77986f16e378210ded43186175bf646fc5f",
            symbol: "FRAX",
            tokenName: "FRAX",
            tokenAddress: "0xfc00000000000000000000000000000000000001",
            decimals: 8,
            startBlock: 12974028,
            blockRange: 9000,
            dataFeedId: "",
            rpc: "https://eth.llamarpc.com"
        },
        {
            contractAddress: "0x9d78092775DFE715dFe1b0d71aC1a4d6e3652559",
            topics0: "0x0559884fd3a460db3073b7fc896cc77986f16e378210ded43186175bf646fc5f",
            dataFeedId: "",
            symbol: "FXS",
            tokenName: "Frax Share",
            decimals: 8,
            startBlock: 12096377,
            blockRange: 9000,
            rpc: "https://eth.llamarpc.com",
            tokenAddress: "0xfc00000000000000000000000000000000000002"
        },
    ];
    await queuePrice.addBulk(
        data.map((item) => {
            return {
                name: "queue-price-" + item.startBlock + "-" + item.startBlock + item.blockRange,
                data: item,
                opts: {
                    attempts: Number.MAX_SAFE_INTEGER,
                    backoff: {
                        type: "exponential",
                        delay: 1000,
                    },
                    removeOnFail: false,
                    removeOnComplete: true,
                },
            };
        })
    );
}

main();
