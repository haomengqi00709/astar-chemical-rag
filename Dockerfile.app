# Separate deployment for the multi-tenant app (frontend/app)
# Serves the new app at root with SERVE_NEW_APP=true

FROM python:3.12-slim-bookworm

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      curl \
      libreoffice-writer \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
 && pip install --no-cache-dir -r requirements.txt

# Old app deps (server.js lives there)
COPY frontend/AK_chemetics_Company_rag/package.json frontend/AK_chemetics_Company_rag/package-lock.json* ./frontend/AK_chemetics_Company_rag/
RUN cd frontend/AK_chemetics_Company_rag && npm install --prefer-offline 2>/dev/null || npm install

# New app deps
COPY frontend/app/package.json frontend/app/package-lock.json* ./frontend/app/
RUN cd frontend/app && npm install --prefer-offline 2>/dev/null || npm install

# The ChromaDB vector store is deliberately NOT built here — see the note in
# ./Dockerfile. It lives on the Railway volume and is symlinked into
# /app/chroma_db by docker-entrypoint.sh; regenerate it by running
# load_vectorstore.py locally, never during a build.
COPY . .

# Build only the new app
RUN cd frontend/app && npm run build

ENV PYTHON_PATH=/usr/local/bin/python3
ENV SERVE_NEW_APP=true
ENV PYTHONUNBUFFERED=1

RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 3001

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "frontend/AK_chemetics_Company_rag/server.js"]
