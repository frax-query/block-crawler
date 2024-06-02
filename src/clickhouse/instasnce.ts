import { createClient } from "@clickhouse/client";
import 'dotenv/config'

export const client = createClient({
    url: "http://" + process.env["DATABASE_HOST"] + ":8123", // defaults to 'http://localhost:8123'
    password: process.env["DATABASE_PASSWORD"], // defaults to an empty string,
    database: "fraxtal_mainnet",
});