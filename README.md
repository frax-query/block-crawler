# Fraxtal Network Block Crawler

This repository contains a robust Fraxtal network data indexer that crawls and stores block, transaction, and log data. It uses BullMQ for efficient job scheduling and processing.

## Overview

The Fraxtal Block Crawler is designed to index Fraxtal blockchain data in a scalable and efficient manner. It crawls blocks, transactions, logs, and extracts additional data such as token transfers and NFT transfers.

## Features

- Crawls Fraxtal blocks, transactions, and logs
- Extracts and indexes token transfers, NFT transfers, and other decoded data
- Uses BullMQ for job scheduling and processing
- Scalable architecture for handling large volumes of blockchain data
- Automatically schedules new jobs to ensure continuous crawling

## Architecture

The crawler uses a job queue system to manage the crawling process:

1. Initial job added to queue: Crawl blocks X to Y
2. Worker picks up the job and processes blocks X to Y
3. Upon completion, worker adds multiple new jobs:
   a. Crawl next block range (Y+1 to Z)
   b. Crawl detailed transaction logs for processed blocks
   c. Extract token transfers from processed logs
   d. Extract NFT transfers from processed logs
   e. Extract other decoded data from processed logs

This cycle continues, ensuring continuous crawling and data extraction from the Fraxtal blockchain.

## Flow Diagram

```mermaid
graph TD
    A[Start] --> B[Add initial block range job to queue]
    B --> C[Worker picks up job]
    C --> D[Process blocks X to Y]
    D --> E{Job completed?}
    E -->|Yes| F[Add next block range job Y+1 to Z]
    E -->|Yes| G[Add transaction log job for blocks X to Y]
    F --> C
    G --> H[Worker processes transaction logs]
    H --> I[Add token transfer job]
    H --> J[Add NFT transfer job]
    H --> K[Add other decoded data job]
    I --> L[Process token transfers]
    J --> M[Process NFT transfers]
    K --> N[Process other decoded data]
    E -->|No| C
