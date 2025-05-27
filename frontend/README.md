# IntruderGuard Frontend

This is the frontend for the IntruderGuard application, featuring a dynamic and modern dark-themed user interface for monitoring network security.

## Prerequisites

- Node.js (v18 or later recommended)
- npm or yarn

## Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   # or
   # yarn install
   ```

## Running the Development Server

```bash
npm run dev
# or
# yarn dev
```

This will start the development server, usually on `http://localhost:3000`.

## Building for Production

```bash
npm run build
# or
# yarn build
```

## Starting the Production Server

```bash
npm run start
# or
# yarn start
```

## Backend Interaction

Ensure the backend server is running on the same machine. The frontend will attempt to connect to the following backend endpoints:

- **Trigger Detection (POST):** `/trigger-detection`
- **Live Alerts (WebSocket):** `/ws/alerts` (or polling `/latest-alert`)
- **Logs API (GET):** `/logs`

(These endpoints might need adjustment based on the actual backend implementation.)