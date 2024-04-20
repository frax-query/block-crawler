import { ClickHouseError } from '@clickhouse/client';
import { client } from './instasnce';
import { log_events } from "../types";

const table_name = 'viction_mainnet.log_events';

export const insertLog = async (values: log_events[]) => {
    const promises = [...new Array(10)].map(async () => {
        await client
          .insert({
            table: table_name,
            values,
            format: 'JSONEachRow'
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