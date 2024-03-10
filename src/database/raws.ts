import { db } from "./instance";
import { NewRaws } from "../types";

export async function insertRaws(params: NewRaws[]) {
    return await db
        .insertInto("raws")
        .values(params)
        .onConflict((e) => e.doNothing())
        .execute();
}

export async function findLatestBlock() {
    return await db
        .selectFrom("raws")
        .select("block_number")
        .orderBy("block_number desc")
        .limit(1)
        .execute()
}
