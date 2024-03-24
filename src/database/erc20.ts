import { db } from "./instance";
import { NewErc20 } from "../types";

export async function insertErc20(params: NewErc20[]) {
    return await db.transaction().execute(async (trx) => {
        let batch = [];
        for (const item of params) {
            batch.push(item);
            if (batch.length === 100) {
                trx.insertInto("erc20")
                    .values(batch)
                    .onConflict((e) => e.doNothing())
                    .executeTakeFirstOrThrow();
                batch = [];
            }
        }
        if (batch.length) {
            trx.insertInto("erc20")
                .values(batch)
                .onConflict((e) => e.doNothing())
                .executeTakeFirstOrThrow();
        }
    });
}