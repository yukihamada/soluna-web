FROM node:22-bookworm-slim

# apt: stable layer — only rebuilds if packages change
RUN apt-get update && apt-get install -y --no-install-recommends \
    libchromaprint-tools \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# server deps: cached until server-package.json changes
COPY server-package.json package.json
RUN npm install --omit=dev

# docs: rarely changes
COPY docs/ docs/

# cabin HTML files: large but changes less often than out/
COPY cabin/ cabin/

# Next.js static output: pre-built in CI, changes every deploy
COPY out/ out/

# server entry: often changes — last so other layers stay cached
COPY server.js .

EXPOSE 3000
CMD ["node", "server.js"]
