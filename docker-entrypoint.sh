#!/bin/sh
#
# Wire the persistent ChromaDB vector store into the path the application
# expects before handing off to the real command.
#
# Every module resolves the store as `<repo root>/chroma_db` (query.py,
# agent.py, calc_agent.py, evaluate.py and each work_agents/*/ *_agent.py all
# define their own CHROMA_PATH). Inside the image that is /app/chroma_db.
# Rather than touch seven call sites, we symlink that path onto the Railway
# volume so the store survives image rebuilds — the store is far too slow to
# regenerate during a build.
#
set -e

# Mirror Path(__file__).parent from the Python side: this script sits at the
# repo root, so its own directory is the root the modules resolve against.
APP_DIR="$(cd "$(dirname "$0")" && pwd)"
LINK="$APP_DIR/chroma_db"

STORE="${CHROMA_STORE_DIR:-${RAILWAY_VOLUME_MOUNT_PATH:-/app/data}/chroma_db}"
mkdir -p "$STORE"

# First boot on a fresh volume: pull a prebuilt store instead of embedding from
# scratch. Optional — unset CHROMA_SEED_URL to skip.
if [ ! -f "$STORE/chroma.sqlite3" ] && [ -n "$CHROMA_SEED_URL" ]; then
  echo "[entrypoint] vector store empty — seeding from CHROMA_SEED_URL..."
  # Download before extracting: in a pipeline the exit status is tar's, so a
  # failed curl would otherwise be reported as a successful seed. Staged on the
  # volume rather than /tmp — the archive runs ~80MB.
  SEED_TMP="${STORE}.seed.tgz"
  if curl -fsSL "$CHROMA_SEED_URL" -o "$SEED_TMP" && tar -xzf "$SEED_TMP" -C "$STORE"; then
    echo "[entrypoint] seed complete."
  else
    echo "[entrypoint] WARN: seed failed; continuing with an empty store." >&2
  fi
  rm -f "$SEED_TMP"
fi

# chroma_db/ is in .dockerignore, so $LINK does not exist in the image and this
# has nothing to clobber. -n keeps a restart from nesting the link inside
# itself; a real directory there (local runs) is left alone.
if [ -e "$LINK" ] && [ ! -L "$LINK" ]; then
  echo "[entrypoint] $LINK is a real directory — leaving it as-is."
else
  ln -sfn "$STORE" "$LINK"
fi

if [ -f "$STORE/chroma.sqlite3" ]; then
  echo "[entrypoint] vector store ready at $STORE"
else
  echo "[entrypoint] WARN: no vector store at $STORE — retrieval will fail until it is seeded." >&2
fi

exec "$@"
