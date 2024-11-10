# Sinova URL Shortener API

URL Shortener API test task for Sinova vacancy. Made with NestJS + TypeScript, MongoDB and Redis

## Setup instructions

1. Get MongoDB and Redis ready for use (setup DBs, users with Read/Write permissions and get connection URIs)
2. Create `./.env` and fill it with required data (including MongoDB and Redis connection URIs)

```sh
PORT = 3001
SERVER_URL = "http://localhost:3001"
MONGO_URI = "mongodb+srv://..."
REDIS_URI = "redis://..."
```

3. Run the following commands

```sh
npm install
npm run build
npm run start
```
