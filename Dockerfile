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

# Layer 4: App code — rebuilds every push (keep this small via .dockerignore)
#
# NOTE: the ChromaDB vector store is deliberately NOT built here. Embedding
# ~8.8k chunks needs ~176 Gemini API calls, which exceeded the build deadline
# (and hard-fails whenever the Gemini quota is exhausted). The store now lives
# on the Railway volume and is symlinked into /app/chroma_db by
# docker-entrypoint.sh, so it survives image rebuilds. Regenerate it by running
# load_vectorstore.py locally, not during the build.
#
# chroma_db/ stays in .dockerignore so the image never shadows the volume copy.
COPY . .

# Layer 5: Build React frontends
RUN cd frontend/AK_chemetics_Company_rag && npm run build
RUN cd frontend/app && npm run build

# ── Runtime ───────────────────────────────────────────────────────────────────
ENV PYTHON_PATH=/usr/local/bin/python3
ENV PYTHONUNBUFFERED=1

RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 3001

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "frontend/AK_chemetics_Company_rag/server.js"]
