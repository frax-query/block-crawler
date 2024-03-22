import { db } from "./instance";
import { NewLogEvents } from "../types";

export async function insertRaws(params: NewLogEvents[]) {
    return await db.transaction().execute(async (trx) => {
        let batch = [];
        for (const item of params) {
            batch.push(item);
            if (batch.length === 100) {
                trx.insertInto("log_events")
                    .values(batch)
                    .onConflict((e) => e.doNothing())
                    .executeTakeFirstOrThrow();
                batch = [];
            }
        }
        if (batch.length) {
            trx.insertInto("log_events")
                .values(batch)
                .onConflict((e) => e.doNothing())
                .executeTakeFirstOrThrow();
        }
    });
}

export async function findLatestBlock() {
    return await db
        .selectFrom("transactions")
        .select(({ fn }) => [fn.max("block_number").as("block_number")])
        .execute();
}
