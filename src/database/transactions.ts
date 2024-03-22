import { db } from "./instance";
import { NewTransactions } from "../types";

export async function insertTransactions(params: NewTransactions[]) {
    return await db.transaction().execute(async (trx) => {
        let batch = [];
        for (const item of params) {
            batch.push(item);
            if (batch.length === 100) {
                trx.insertInto("transactions")
                    .values(batch)
                    .onConflict((e) => e.doNothing())
                    .executeTakeFirstOrThrow();
                batch = [];
            }
        }
        if (batch.length) {
            trx.insertInto("transactions")
                .values(batch)
                .onConflict((e) => e.doNothing())
                .executeTakeFirstOrThrow();
        }
    });
}