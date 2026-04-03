# ── Base: Python 3.12 + Node 20 ──────────────────────────────────────────────
FROM python:3.12-slim-bookworm

# Install Node.js 20
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ── Python dependencies ───────────────────────────────────────────────────────
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# ── Node dependencies ─────────────────────────────────────────────────────────
COPY frontend/AK_chemetics_Company_rag/package*.json ./frontend/AK_chemetics_Company_rag/
RUN cd frontend/AK_chemetics_Company_rag && npm install

# ── Copy application code ─────────────────────────────────────────────────────
COPY . .

# ── Build React frontend ──────────────────────────────────────────────────────
RUN cd frontend/AK_chemetics_Company_rag && npm run build

# ── Runtime ───────────────────────────────────────────────────────────────────
# ChromaDB is built at first startup (not build time) so GOOGLE_API_KEY stays
# a runtime secret and Docker builds are fast. Mount a Railway volume at
# /app/chroma_db so the vector store persists across redeploys.
ENV PYTHON_PATH=/usr/local/bin/python3

EXPOSE 3001

# Entrypoint: build vector store if DB is empty, then start server
CMD ["sh", "-c", "python3 load_vectorstore.py --skip-if-exists && node frontend/AK_chemetics_Company_rag/server.js"]
