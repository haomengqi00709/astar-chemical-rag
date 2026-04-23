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

COPY parsed_chunks.json .
COPY load_vectorstore.py .

ARG GOOGLE_API_KEY
RUN GOOGLE_API_KEY=${GOOGLE_API_KEY} python3 load_vectorstore.py

COPY . .

# Build only the new app
RUN cd frontend/app && npm run build

ENV PYTHON_PATH=/usr/local/bin/python3
ENV SERVE_NEW_APP=true

EXPOSE 3001

CMD ["node", "frontend/AK_chemetics_Company_rag/server.js"]
