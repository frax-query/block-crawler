import { transactions } from "../types";
import { client } from "./instasnce";
import { ClickHouseError } from "@clickhouse/client";

const table_name = 'viction_mainnet.transactions';

export const findMaxBlock = async () => {
    const rows = await client.query({
        query: `SELECT max(block_number) as max_block FROM ${table_name} limit 1`,
        format: "JSONEachRow",
      })
      const result: {max_block: string}[] = await rows.json();
        return Number(result[0].max_block);
}

export const insertTx = async (values: transactions[]) => {
    const promises = [...new Array(10)].map(async () => {
        await client
          .insert({
            table: table_name,
            values,
            format: "JSONEachRow"
          })
          .catch((err) => {
            if (err instanceof ClickHouseError) {
              console.error(`ClickHouse error: ${err.code}. Insert failed:`, err)
              return
            }
            console.error('Insert failed:', err)
          })
      })
      await Promise.all(promises)
}