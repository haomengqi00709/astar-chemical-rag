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

# Layer 4: App code — rebuilds every push (keep this small via .dockerignore)
COPY . .

# Layer 5: Build React frontend
RUN cd frontend/AK_chemetics_Company_rag && npm run build

# Layer 6: Build ChromaDB vector store
ARG GOOGLE_API_KEY
RUN GOOGLE_API_KEY=${GOOGLE_API_KEY} python3 load_vectorstore.py

# ── Runtime ───────────────────────────────────────────────────────────────────
ENV PYTHON_PATH=/usr/local/bin/python3

EXPOSE 3001

CMD ["node", "frontend/AK_chemetics_Company_rag/server.js"]
