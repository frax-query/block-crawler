import { erc20 } from "../types";
import { client } from "./instasnce";
import { ClickHouseError } from "@clickhouse/client";

const table_name = 'viction_mainnet.erc20';

export const insertErc20 = async (values: erc20[]) => {
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