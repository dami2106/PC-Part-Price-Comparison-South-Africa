import json
import os
import uuid
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from matcher import ProductMatcher

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "..", "Data")
BUILDS_DIR = os.path.join(BASE_DIR, "builds")
os.makedirs(BUILDS_DIR, exist_ok=True)

# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = FastAPI(title="PC Parts Price Comparator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load data and build indices at startup (may take a few seconds)
print("Loading product data and building search indices…")
matcher = ProductMatcher(DATA_DIR)
print(f"Loaded {len(matcher.df):,} products across {matcher.df['store'].nunique()} stores.")

# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------


class BuildComponent(BaseModel):
    category: str
    title: str
    store: str
    price: int
    url: str
    image_url: Optional[str] = ""


class BuildPayload(BaseModel):
    name: str
    components: dict[str, Optional[BuildComponent]] = {}


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@app.get("/api/categories")
def get_categories():
    return {"categories": matcher.get_categories()}


@app.get("/api/search")
def search(query: str = "", category: Optional[str] = None):
    if not query.strip():
        return {"groups": []}
    groups = matcher.search(query.strip(), category or None)
    return {"groups": groups}


# --- Builds CRUD ---


@app.get("/api/builds")
def list_builds():
    builds = []
    for fname in os.listdir(BUILDS_DIR):
        if not fname.endswith(".json"):
            continue
        with open(os.path.join(BUILDS_DIR, fname)) as f:
            build = json.load(f)
        total = sum(
            c["price"] for c in build.get("components", {}).values() if c
        )
        builds.append(
            {
                "id": build["id"],
                "name": build["name"],
                "total_price": total,
                "created_at": build.get("created_at", ""),
                "updated_at": build.get("updated_at", ""),
            }
        )
    builds.sort(key=lambda b: b.get("updated_at", ""), reverse=True)
    return {"builds": builds}


@app.post("/api/builds")
def create_build(payload: BuildPayload):
    build_id = str(uuid.uuid4())[:8]
    now = datetime.utcnow().isoformat()
    data = {
        "id": build_id,
        "name": payload.name,
        "components": {
            k: v.model_dump() if v else None for k, v in payload.components.items()
        },
        "created_at": now,
        "updated_at": now,
    }
    _save_build(build_id, data)
    return data


@app.get("/api/builds/{build_id}")
def get_build(build_id: str):
    return _load_build(build_id)


@app.put("/api/builds/{build_id}")
def update_build(build_id: str, payload: BuildPayload):
    existing = _load_build(build_id)
    existing["name"] = payload.name
    existing["components"] = {
        k: v.model_dump() if v else None for k, v in payload.components.items()
    }
    existing["updated_at"] = datetime.utcnow().isoformat()
    _save_build(build_id, existing)
    return existing


@app.delete("/api/builds/{build_id}")
def delete_build(build_id: str):
    path = _build_path(build_id)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Build not found")
    os.remove(path)
    return {"ok": True}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _build_path(build_id: str) -> str:
    return os.path.join(BUILDS_DIR, f"{build_id}.json")


def _load_build(build_id: str) -> dict:
    path = _build_path(build_id)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Build not found")
    with open(path) as f:
        return json.load(f)


def _save_build(build_id: str, data: dict):
    with open(_build_path(build_id), "w") as f:
        json.dump(data, f, indent=2)
