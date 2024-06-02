import { client } from "./instasnce";
import { ILogs } from "../types";

const table_name = "fraxtal_mainnet.log_events";

export const insertLog = async (values: ILogs[]) => {
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
