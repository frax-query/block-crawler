export const queueName = "block-crawler"

import {
    Insertable,
    Selectable,
    Updateable,
} from "kysely";

export interface Database {
    raws: raws;
}

export interface raws {
    tx_hash: string;
    block_number: number;
    timestamp: number;
    block_hash: string;
    address: string;
    data: string;
    topics: readonly string[];
    transaction_index: number;
}

export type Raws = Selectable<raws>;
export type NewRaws = Insertable<raws>;
export type UpdateRaws = Updateable<raws>;