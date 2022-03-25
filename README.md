# Titeenipeli 2022 frontend

<img width="1409" alt="screenshot" src="https://user-images.githubusercontent.com/6438345/159185311-ff770c9e-3958-4e2b-ac2a-31bcd5901dd3.png">

Read the postmortem: https://docs.google.com/document/d/1Yp9LTFt-slZd7y6EQcgmbF7DzFsBGKLnxCfNW1ZZiWA/edit?usp=sharing

Backend repository: https://github.com/Cadiac/titeenit-backend

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
