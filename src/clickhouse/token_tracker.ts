import { token_tracker } from "../types";
import { client } from "./instasnce";
import { ClickHouseError } from "@clickhouse/client";

const table_name = "viction_mainnet.token_tracker";

export const getTokenByIsTrackedFalseLimit1 = async () => {
    const rows = await client.query({
        query: `SELECT token_address FROM ${table_name} where is_tracked = 0 limit 1`,
        format: "JSONEachRow",
    });
    const result: { token_address: string }[] = await rows.json();
    return result;
};

export const insertTokenTracker = async (values: token_tracker[]) => {
    const promises = [...new Array(10)].map(async () => {
        await client
            .insert({
                table: table_name,
                values,
                format: "JSONEachRow",
            })
            .catch((err) => {
                if (err instanceof ClickHouseError) {
                    console.error(
                        `ClickHouse error: ${err.code}. Insert failed:`,
                        err
                    );
                    return;
                }
                console.error("Insert failed:", err);
            });
    });
    await Promise.all(promises);
};

export const updateByToken = async (address: string) => {
    await client.query({
        query: `ALTER TABLE ${table_name} UPDATE is_tracked = 1 WHERE token_address = '${address}'`,
        format: "JSONEachRow",
    });
};
