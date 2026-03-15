import json
import os
import uuid
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, HTTPException, Query
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


class PublishPayload(BaseModel):
    author: str = "Anonymous"
    description: str = ""


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


def _total_price(build: dict) -> int:
    return sum(c["price"] for c in build.get("components", {}).values() if c)


def _to_summary(build: dict) -> dict:
    return {
        "id": build["id"],
        "name": build["name"],
        "total_price": _total_price(build),
        "created_at": build.get("created_at", ""),
        "updated_at": build.get("updated_at", ""),
    }


def _to_community_summary(build: dict) -> dict:
    return {
        "id": build["id"],
        "name": build["name"],
        "author": build.get("author", "Anonymous"),
        "description": build.get("description", ""),
        "total_price": _total_price(build),
        "component_count": sum(1 for c in build.get("components", {}).values() if c),
        "components": build.get("components", {}),
        "published_at": build.get("published_at", ""),
        "likes": build.get("likes", 0),
    }


# ---------------------------------------------------------------------------
# Endpoints — Categories & Search
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


# ---------------------------------------------------------------------------
# Endpoints — Private Builds CRUD
# ---------------------------------------------------------------------------


@app.get("/api/builds")
def list_builds():
    builds = []
    for fname in os.listdir(BUILDS_DIR):
        if not fname.endswith(".json"):
            continue
        with open(os.path.join(BUILDS_DIR, fname)) as f:
            build = json.load(f)
        builds.append(_to_summary(build))
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
        "published": False,
        "published_at": None,
        "author": "Anonymous",
        "description": "",
        "likes": 0,
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
# Endpoints — Publish / Unpublish
# ---------------------------------------------------------------------------


@app.post("/api/builds/{build_id}/publish")
def publish_build(build_id: str, payload: PublishPayload):
    build = _load_build(build_id)
    components = {k: v for k, v in build.get("components", {}).items() if v}
    if not components:
        raise HTTPException(status_code=400, detail="Cannot publish an empty build")
    build["published"] = True
    build["published_at"] = datetime.utcnow().isoformat()
    build["author"] = payload.author.strip() or "Anonymous"
    build["description"] = payload.description.strip()
    _save_build(build_id, build)
    return _to_community_summary(build)


@app.post("/api/builds/{build_id}/unpublish")
def unpublish_build(build_id: str):
    build = _load_build(build_id)
    build["published"] = False
    _save_build(build_id, build)
    return {"ok": True}


# ---------------------------------------------------------------------------
# Endpoints — Community
# ---------------------------------------------------------------------------


@app.get("/api/community")
def list_community(sort: str = Query("newest", pattern="^(newest|liked|price_asc|price_desc)$")):
    builds = []
    for fname in os.listdir(BUILDS_DIR):
        if not fname.endswith(".json"):
            continue
        with open(os.path.join(BUILDS_DIR, fname)) as f:
            build = json.load(f)
        if build.get("published"):
            builds.append(_to_community_summary(build))

    if sort == "newest":
        builds.sort(key=lambda b: b.get("published_at", ""), reverse=True)
    elif sort == "liked":
        builds.sort(key=lambda b: b.get("likes", 0), reverse=True)
    elif sort == "price_asc":
        builds.sort(key=lambda b: b.get("total_price", 0))
    elif sort == "price_desc":
        builds.sort(key=lambda b: b.get("total_price", 0), reverse=True)

    return {"builds": builds}


@app.post("/api/community/{build_id}/like")
def like_build(build_id: str):
    build = _load_build(build_id)
    if not build.get("published"):
        raise HTTPException(status_code=404, detail="Build not in community")
    build["likes"] = build.get("likes", 0) + 1
    _save_build(build_id, build)
    return {"likes": build["likes"]}


@app.post("/api/community/{build_id}/fork")
def fork_build(build_id: str):
    """Copy a community build into a new private build."""
    source = _load_build(build_id)
    if not source.get("published"):
        raise HTTPException(status_code=404, detail="Build not in community")

    new_id = str(uuid.uuid4())[:8]
    now = datetime.utcnow().isoformat()
    forked = {
        "id": new_id,
        "name": f"{source['name']} (forked)",
        "components": source.get("components", {}),
        "created_at": now,
        "updated_at": now,
        "published": False,
        "published_at": None,
        "author": "Anonymous",
        "description": "",
        "likes": 0,
    }
    _save_build(new_id, forked)
    return forked
