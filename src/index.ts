import { queue, queueErc20 } from "./utils"
import config from "./config";

async function main() {
    await queue.add(
        "viction_mainnet",
        { blockRange: config.blockRange },
        {
            attempts: 3,
            repeat: { every: config.queueConfig.repeat.every },
            removeOnComplete: config.queueConfig.removeOnComplete,
            removeOnFail: config.queueConfig.removeOnFail,
        }
    );

    await queueErc20.add(
        "viction_mainet_erc20",
        {},
        {
            attempts: 1,
            repeat: {
                every: 60000
            },
            removeOnComplete: true,
            removeOnFail: true
        }
    )
}

main();
