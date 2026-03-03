FROM node:22-alpine

# native deps for better-sqlite3
RUN apk add --no-cache python3 make g++

WORKDIR /app

# install only server deps
COPY server-package.json package.json
RUN npm install --omit=dev

# static files (built by Next.js)
COPY out/ out/

# server entry point
COPY server.js .

EXPOSE 3000
CMD ["node", "server.js"]
