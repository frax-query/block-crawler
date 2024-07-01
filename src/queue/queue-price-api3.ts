import { IJobPriceAPI3 } from "../types";
import { queuePrice } from "../utils";

async function main() {
    const dataPrices: IJobPriceAPI3[] = [
        {
            contractAddress: "0x709944a48cAf83535e43471680fDA4905FB3920a",
            dataFeedId:
                "0xf8ad209868a23b73fe3f8efc261da77e1c6bae480894e992d1019c7f907b247a",
            topics0:
                "0xb7712be6248d021e8c56ac9613c09491354a4d0f4ad0b7db1a664b35be4b2349",
            tokenName: "Frax Share",
            symbol: "FXS",
            decimals: 18,
            tokenAddress: "0xfc00000000000000000000000000000000000002",
            rpc: null,
            startBlock: 5122080,
            blockRange: 50000,
        },
        {
            contractAddress: "0x709944a48cAf83535e43471680fDA4905FB3920a",
            dataFeedId:
                "0xc60c595ae32a6380f09f205d67fdf47b47395051e5a4591ef42f510512f5d58b",
            topics0:
                "0xb7712be6248d021e8c56ac9613c09491354a4d0f4ad0b7db1a664b35be4b2349",
            tokenName: "FRAX",
            symbol: "FRAX",
            tokenAddress: "0xfc00000000000000000000000000000000000001",
            decimals: 18,
            rpc: null,
            startBlock: 6203739,
            blockRange: 50000,
        },
        {
            contractAddress: "0x709944a48cAf83535e43471680fDA4905FB3920a",
            dataFeedId:
                "0x46943ffe87750e941b301d2a141d53106df392bcc6e65a3b07354fdd6f1f45fc",
            topics0:
                "0xb7712be6248d021e8c56ac9613c09491354a4d0f4ad0b7db1a664b35be4b2349",
            tokenName: "frxETH",
            symbol: "frxETH",
            tokenAddress: "0xfc00000000000000000000000000000000000006",
            decimals: 18,
            rpc: "https://arbitrum.llamarpc.com",
            startBlock: 216527297,
            blockRange: 9000,
        },
    ];
    queuePrice.addBulk(
        dataPrices.map((item) => {
            return {
                data: item,
                name:
                    "queue-price-api3-" +
                    item.startBlock +
                    "-" +
                    item.startBlock +
                    item.blockRange,
                opts: {
                    attempts: Number.MAX_SAFE_INTEGER,
                    backoff: {
                        type: "exponential",
                        delay: 500,
                    },
                    removeOnFail: false,
                    removeOnComplete: true,
                },
            };
        })
    );
}

main();
