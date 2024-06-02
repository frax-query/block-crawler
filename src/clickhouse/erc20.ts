import { client } from "./instasnce";
import { IERC20 } from "../types";

const table_name = "fraxtal_mainnet.erc20";

export const insertErc20 = async (values: IERC20[]) => {
    await client
        .insert({
            table: table_name,
            values,
            format: "JSONEachRow",
        })
        .catch((err) => {
            throw err;
        });
};
