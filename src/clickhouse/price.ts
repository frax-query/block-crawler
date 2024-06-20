import { client } from "./instasnce";
import { IPrice } from "../types";

const table_name = "fraxtal_mainnet.token_prices";

export const insertPrice = async (values: IPrice[]) => {
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
