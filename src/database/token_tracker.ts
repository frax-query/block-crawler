import { db } from "./instance";
import { NewTokenTracker } from "../types";

export async function insertTokenTrackers(params: NewTokenTracker[]) {
    return await db.transaction().execute(async (trx) => {
        let batch = [];
        for (const item of params) {
            batch.push(item);
            if (batch.length === 100) {
                trx.insertInto("token_tracker")
                    .values(batch)
                    .onConflict((e) => e.doNothing())
                    .executeTakeFirstOrThrow();
                batch = [];
            }
        }
        if (batch.length) {
            trx.insertInto("token_tracker")
                .values(batch)
                .onConflict((e) => e.doNothing())
                .executeTakeFirstOrThrow();
        }
    });
}

export async function getTokens() {
    return await db
        .selectFrom("token_tracker")
        .select("token_address")
        .where("is_tracked", "=", false)
        .executeTakeFirst();
}

export async function updateToken(token_address: string) {
    return await db
        .updateTable("token_tracker")
        .set({
            is_tracked: true,
        })
        .where("token_address", "=", token_address)
        .execute();
}
