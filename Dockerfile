FROM node:22-bookworm-slim

# chromaprint (fpcalc) for audio fingerprinting
RUN apt-get update && apt-get install -y --no-install-recommends \
    libchromaprint-tools \
    && rm -rf /var/lib/apt/lists/*

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
