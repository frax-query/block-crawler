import { ITransactions } from "../types";
import { client } from "./instasnce";

const table_name = "fraxtal_mainnet.transactions";

export const insertTransaction = async (values: ITransactions[]) => {
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
