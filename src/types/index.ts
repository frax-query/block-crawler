export interface IBlock {
    block_number: number;
    transaction_hash: string;
    timestamp: number;
    parent_hash: string;
    parent_beacon_block_root: string | null;
    nonce: string;
    difficulty: number;
    gas_limit: number;
    gas_used: number;
    state_root: string;
    receipts_root: string;
    blob_gas_used: number | null;
    excess_blob_gas: number | null;
    miner: string;
    extra_data: string;
    base_fee_per_gas: number | null;
    transactions: readonly string[];
}

export interface ITransactions {
    transaction_hash: string;
    timestamp: number;
    from_address: string;
    to_address: string | null;
    contract_address: string | null;
    index: number;
    block_hash: string;
    block_number: number;
    logsbloom: string;
    gas_used: number;
    blob_gas_used: number | null;
    cummulative_gas_used: number;
    gas_price: number | null;
    blob_gas_price: number | null;
    type: number;
    status: Boolean | number;
    root: string | null;
    value: number;
}

export interface ILogs {
    transaction_hash: string;
    block_hash: string;
    block_number: number;
    timestamp: number;
    address: string;
    data: string;
    topics: readonly string[];
    index: number;
    transaction_index: number;
}

export interface IERC20 {
    token_address: string;
    name: string;
    symbol: string;
    decimals: number;
}