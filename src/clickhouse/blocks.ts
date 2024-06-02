import { client } from "./instasnce";
import { IBlock } from "../types";

const table_name = "fraxtal_mainnet.blocks";

export const insertBlock = async (values: IBlock[]) => {
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
