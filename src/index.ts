import { queueBlock } from "./utils";
import config from "./config";

async function main() {
    await queueBlock.add(
        `block-1-${config.blockRange}`,
        { from: 4819510 , to: config.blockRange + 4819510  },
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
