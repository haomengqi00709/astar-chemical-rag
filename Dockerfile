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

# ── Build ChromaDB vector store ───────────────────────────────────────────────
# GOOGLE_API_KEY must be set as a Railway Variable (passed as build arg automatically)
ARG GOOGLE_API_KEY
RUN GOOGLE_API_KEY=${GOOGLE_API_KEY} python3 load_vectorstore.py

# ── Runtime ───────────────────────────────────────────────────────────────────
ENV PYTHON_PATH=/usr/local/bin/python3

EXPOSE 3001

CMD ["node", "frontend/AK_chemetics_Company_rag/server.js"]
