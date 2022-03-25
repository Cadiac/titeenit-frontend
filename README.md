# Titeenipeli 2022 frontend

## Quick start

```
cp .env.sample .env
source .env
npm install
npm run dev
```

### Remote backend

For remote backend use

```
VITE_BACKEND_WEBSOCKET_URL=wss://api.titeenipeli.xyz
VITE_BACKEND_API_URL=https://api.titeenipeli.xyz
```

and send `/login` login command to @titeenibot for login.

### Local backend

For local backend use

```
VITE_BACKEND_WEBSOCKET_URL=ws://localhost:4000
VITE_BACKEND_API_URL=http://localhost:4000
```

and login using `/local` command on a bot your own backend hosts.
