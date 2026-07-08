# ── Base: Python 3.12 + Node 20 ──────────────────────────────────────────────
FROM python:3.12-slim-bookworm

# Layer 1: System packages — cached unless base image changes
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      curl \
      libreoffice-writer \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

WORKDIR /app

# Layer 2: Python deps — cached unless requirements.txt changes
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
 && pip install --no-cache-dir -r requirements.txt

# Layer 3: Node deps — cached unless package*.json changes
COPY frontend/AK_chemetics_Company_rag/package.json frontend/AK_chemetics_Company_rag/package-lock.json* ./frontend/AK_chemetics_Company_rag/
RUN cd frontend/AK_chemetics_Company_rag && npm install --prefer-offline 2>/dev/null || npm install

COPY frontend/app/package.json frontend/app/package-lock.json* ./frontend/app/
RUN cd frontend/app && npm install --prefer-offline 2>/dev/null || npm install

# Layer 4: Vector store inputs — cached unless knowledge base changes
# Copy ONLY the files needed for embedding; this layer stays cached on
# regular code pushes so load_vectorstore.py doesn't re-run needlessly.
COPY parsed_chunks.json .
COPY load_vectorstore.py .

# Layer 5: Build ChromaDB vector store — CACHED when parsed_chunks.json unchanged
ARG GOOGLE_API_KEY
RUN GOOGLE_API_KEY=${GOOGLE_API_KEY} python3 load_vectorstore.py

# Layer 6: App code — rebuilds every push (keep this small via .dockerignore)
# chroma_db/ is in .dockerignore so the vector store from Layer 5 is preserved.
COPY . .

# Layer 7: Build React frontends
RUN cd frontend/AK_chemetics_Company_rag && npm run build
RUN cd frontend/app && npm run build

# ── Runtime ───────────────────────────────────────────────────────────────────
ENV PYTHON_PATH=/usr/local/bin/python3

EXPOSE 3001

CMD ["node", "frontend/AK_chemetics_Company_rag/server.js"]
