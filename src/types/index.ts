export const queueName = "block-crawler"

import {
    Insertable,
    Selectable,
    Updateable,
} from "kysely";

export interface Database {
    log_events: log_events;
    transactions: transactions;
    token_tracker: token_tracker;
    erc20: erc20;
}

export interface log_events {
    tx_hash: string;
    block_number: number;
    timestamp: number;
    block_hash: string;
    address: string;
    data: string;
    topics: readonly string[];
    transaction_index: number;
    index: number;
}

export type LogEvents = Selectable<log_events>;
export type NewLogEvents = Insertable<log_events>;
export type UpdateLogEvents = Updateable<log_events>;

export interface transactions {
    tx_hash: string;
    block_number: number;
    timestamp: number;
    block_hash: string;
    index: number;
    type: number;
    from: string;
    to: string;
    nonce: number;
    gas_limit: number;
    gas_price: number;
    max_priority_fee_per_gas: number;
    max_fee_per_gas: number;
    max_fee_per_blob_gas: number;
    data: string;
    value: number
}

export type Transactions = Selectable<transactions>;
export type NewTransactions = Insertable<transactions>;
export type UpdateTransactions = Updateable<transactions>;

export interface token_tracker {
    token_address: string;
    is_tracked: boolean;
}

export type TokenTracker = Selectable<token_tracker>;
export type NewTokenTracker = Insertable<token_tracker>;
export type UpdateTokenTracker = Updateable<token_tracker>;

export interface erc20 {
    token_address: string;
    decimals: number;
    name: string;
    symbol: string;
}

export type Erc20 = Selectable<erc20>;
export type NewErc20 = Insertable<erc20>;
export type UpdateErc20 = Updateable<erc20>;