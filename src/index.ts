import { queueBlock } from "./utils";
import config from "./config";

async function main() {
    const startBlock = 6598131
    await queueBlock.add(
        `block-1-${config.blockRange}`,
        { from: startBlock , to: startBlock + config.blockRange },
        {
            attempts: Number.MAX_SAFE_INTEGER,
            backoff: {
                type: "exponential",
                delay: 1000,
            },
            removeOnFail: false,
            removeOnComplete: true,
        }
    );
}

main();
