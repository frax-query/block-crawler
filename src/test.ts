import { CurrencyInput, CurrencyManager } from "@requestnetwork/currency";
import * as RequestNetwork from "@requestnetwork/request-client.js";
async function main() {
    const payeeSignatureInfo = {
        method: RequestNetwork.Types.Signature.METHOD.ECDSA,
        privateKey:
            "0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3",
    };
    const payeeIdentity = {
        type: RequestNetwork.Types.Identity.TYPE.ETHEREUM_ADDRESS,
        value: "0x627306090abab3a6e1400e9345bc60c78a8bef57",
    };
}

main();
