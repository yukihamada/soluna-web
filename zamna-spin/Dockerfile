FROM debian:bookworm-slim

# CA certificates + libraries for non-static Spin binary
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates libssl3 libgcc-s1 \
    && rm -rf /var/lib/apt/lists/*

# Install Spin 3.6.2 (dynamically linked)
ADD https://github.com/spinframework/spin/releases/download/v3.6.2/spin-v3.6.2-linux-amd64.tar.gz /tmp/spin.tar.gz
RUN tar xzf /tmp/spin.tar.gz -C /usr/local/bin && rm /tmp/spin.tar.gz && chmod +x /usr/local/bin/spin

WORKDIR /app

# Copy WASM components + config
COPY main.wasm spin_static_fs.wasm ./
COPY spin.toml runtime-config.toml entrypoint.sh ./

# Copy static files (Next.js export)
COPY static/ ./static/

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]
