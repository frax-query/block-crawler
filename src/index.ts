import { queueBlock } from "./utils";
import config from "./config";

async function main() {
    await queueBlock.add(
        `block-1-${config.blockRange}`,
        { from: 5185471 , to: 5185471 + config.blockRange },
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
