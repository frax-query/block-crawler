import { queuePrice } from "../utils";

async function main() {
    const data = [
        {
            address: "0xE62B71cf983019BFf55bC83B48601ce8419650CC",
            topics: "0x0559884fd3a460db3073b7fc896cc77986f16e378210ded43186175bf646fc5f",
            symbol: "ETH",
            name: "Ethereum",
            decimals: 8,
            startBlock: 20124605,
        },
        {
            address: "0xdBe1941BFbe4410D6865b9b7078e0b49af144D2d",
            topics: "0x0559884fd3a460db3073b7fc896cc77986f16e378210ded43186175bf646fc5f",
            symbol: "BTC",
            name: "Bitcoin",
            decimals: 8,
            startBlock: 20124605,
        },
        {
            address: "0x61eB091ea16A32ea5B880d0b3D09d518c340D750",
            topics: "0x0559884fd3a460db3073b7fc896cc77986f16e378210ded43186175bf646fc5f",
            symbol: "FRAX",
            name: "FRAX",
            decimals: 8,
            startBlock: 20124605,
        },
        {
            address: "0x9d78092775DFE715dFe1b0d71aC1a4d6e3652559",
            topics: "0x0559884fd3a460db3073b7fc896cc77986f16e378210ded43186175bf646fc5f",
            symbol: "FXS",
            name: "Frax Share",
            decimals: 8,
            startBlock: 20124605,
        },
    ];
    await queuePrice.addBulk(
        data.map((item) => {
            return {
                name: `queue-price-${item.startBlock}-${
                    item.startBlock + 50000
                }-${item.address}`,
                data: {
                    fromBlock: item.startBlock,
                    toBlock: item.startBlock + 50000,
                    address: item.address,
                    topics: item.topics,
                    name: item.name,
                    symbol: item.symbol,
                    decimals: item.decimals,
                },
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
