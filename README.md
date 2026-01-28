# Pastebin Lite

A minimal Pastebin-like application built with Next.js (App Router), TypeScript, and Vercel KV.

## Features

- **Health Check API**: Verify system and Redis connectivity.
- **Create Paste**: Create pastes with optional TTL and maximum view limits.
- **Fetch Paste**: Atomic view counting and automatic expiration.
- **Safe Rendering**: View pastes safely without script execution.
- **Deterministic Testing**: Support for `TEST_MODE` with custom timestamps via headers.

## Getting Started

### Local Development

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Setup Environment Variables**:
   Create a `.env.local` file with your Vercel KV credentials:
   ```env
   KV_URL=...
   KV_REST_API_URL=...
   KV_REST_API_TOKEN=...
   KV_REST_API_READ_ONLY_TOKEN=...
   ```
4. **Run the development server**:
   ```bash
   npm run dev
   ```
5. **Open [http://localhost:3000](http://localhost:3000)** in your browser.

## Persistence Layer

This application uses **Vercel KV (Redis)** for all data persistence. 
- **Atomic Operations**: Uses Lua scripts (`EVAL`) to ensure that view counts are decremented atomically and checked against expiration limits in a single operation.
- **Data Structure**: Pastes are stored as Redis Hashes (`HSET`) with the following fields:
  - `content`: The text content of the paste.
  - `remaining_views`: Counter for view limits (-1 for unlimited).
  - `expires_at`: ISO string for display.
  - `expires_at_ms`: Unix timestamp in milliseconds for efficient TTL comparison.

## Design Decisions

- **Serverless Safe**: The implementation avoids global mutable state and uses atomic Redis operations to handle concurrent requests in a serverless environment.
- **Deterministic Time**: For testing purposes, the application can use a provided timestamp from the `x-test-now-ms` header when `TEST_MODE=1` is set, allowing for reliable testing of expiration logic.
- **Nanoid**: Uses `nanoid` to generate short, URL-friendly IDs for pastes.
- **App Router**: Leverages Next.js App Router for both API routes and Server Components.
