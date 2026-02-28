import re
import os
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from rapidfuzz import fuzz

STORE_MAP = {
    "0_DreamWareTech": "DreamWareTech",
    "1_Evetech": "Evetech",
    "2_Rebeltech": "Rebeltech",
    "3_Takealot": "Takealot",
    "4_Wootware": "Wootware",
    "5_Progenix": "Progenix",
    "6_Titanice": "Titanice",
}

# Regex patterns: (pattern, type_tag)
# All assume titles are already lowercased
MODEL_PATTERNS = [
    # Intel CPUs: i3/i5/i7/i9 + gen model (e.g. i5 12600k, i9-13900k)
    (r"i[3579][\s\-]?\d{4,5}[a-z]{0,3}", "cpu_intel"),
    # AMD CPUs: ryzen N NNNN[x/e/g] (e.g. ryzen 5 5600x)
    (r"ryzen\s+[3579]\s+\d{4}[a-z]{0,2}", "cpu_amd"),
    # NVIDIA GPUs: rtx/gtx NNNN [ti] [super] (e.g. rtx 4070 ti super)
    (r"(?:rtx|gtx)\s*\d{4}(?:\s*ti)?(?:\s*super)?", "gpu_nvidia"),
    # AMD GPUs: rx NNNN [xt/xtx/gre] (e.g. rx 7900 xtx)
    (r"rx\s*\d{4}(?:\s*(?:xtx|xt|gre))?", "gpu_amd"),
    # Intel Arc GPUs: arc a/b NNN (e.g. arc a770)
    (r"arc\s+[ab]\d{3}[a-z]?", "gpu_intel"),
    # Motherboard chipsets (e.g. z790, b650, x570, h610, a620)
    (r"\b(?:z\d{3}|b\d{3}|x\d{3}|h\d{3}|a\d{3})\b", "mobo"),
    # RAM: NNNNN mhz or ddr4/ddr5 NNN (speed) — for storage use capacity
    (r"ddr[45]\s*\d{4}", "ram"),
    # Storage capacity (e.g. 1tb, 512gb, 2tb)
    (r"\d+\s*(?:tb|gb)\b", "storage"),
]


def _normalize_model(model: str) -> str:
    """Lowercase, strip dashes, collapse spaces."""
    model = model.lower()
    model = re.sub(r"[-_]", " ", model)
    model = re.sub(r"\s+", " ", model)
    return model.strip()


class ProductMatcher:
    def __init__(self, data_dir: str):
        self.data_dir = data_dir
        self.df = self._load_data()
        self.vectorizers: dict[str, tuple] = {}
        self._build_indices()

    # ------------------------------------------------------------------
    # Data loading
    # ------------------------------------------------------------------

    def _load_data(self) -> pd.DataFrame:
        dfs = []
        for fname in sorted(os.listdir(self.data_dir)):
            if not fname.endswith(".csv"):
                continue
            key = fname.replace(".csv", "")
            store = STORE_MAP.get(key, key)
            path = os.path.join(self.data_dir, fname)
            try:
                df = pd.read_csv(path, dtype={"Price": str})
                df["store"] = store
                dfs.append(df)
            except Exception as e:
                print(f"Warning: could not load {fname}: {e}")

        if not dfs:
            return pd.DataFrame(columns=["Title", "Price", "In Stock", "Category", "URL", "Image URL", "store"])

        combined = pd.concat(dfs, ignore_index=True)

        # Normalise In Stock — raw CSVs store "True"/"False" strings
        combined = combined[combined["In Stock"].astype(str).str.lower() == "true"].copy()

        # Normalise Price to int (some CSVs may have "R 1 299.00" or plain "1299")
        combined["price_int"] = (
            combined["Price"]
            .astype(str)
            .str.replace(r"[^\d.]", "", regex=True)
            .str.split(".")
            .str[0]
            .replace("", "0")
            .astype(int)
        )

        # Drop rows with no title or zero price
        combined = combined.dropna(subset=["Title"])
        combined = combined[combined["price_int"] > 0]

        # Ensure Image URL column exists
        if "Image URL" not in combined.columns:
            combined["Image URL"] = ""

        combined = combined.reset_index(drop=True)
        return combined

    # ------------------------------------------------------------------
    # TF-IDF index
    # ------------------------------------------------------------------

    def _build_indices(self):
        for cat in self.df["Category"].dropna().unique():
            cat_df = self.df[self.df["Category"] == cat]
            titles = cat_df["Title"].fillna("").tolist()
            if len(titles) < 2:
                continue
            vec = TfidfVectorizer(analyzer="word", ngram_range=(1, 2), min_df=1)
            matrix = vec.fit_transform(titles)
            self.vectorizers[cat] = (vec, matrix, cat_df.index.tolist())

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def get_categories(self) -> list[str]:
        return sorted(self.df["Category"].dropna().unique().tolist())

    def search(self, query: str, category: str | None = None, top_k: int = 120) -> list[dict]:
        query = query.lower().strip()
        if not query:
            return []

        if category and category in self.vectorizers:
            candidates = self._tfidf_search(query, category, top_k)
        else:
            # Search each category, take top 15 per category
            parts = []
            cats = [category] if category else list(self.vectorizers.keys())
            for cat in cats:
                if cat in self.vectorizers:
                    parts.append(self._tfidf_search(query, cat, 15))
            candidates = pd.concat(parts) if parts else pd.DataFrame()

        if candidates.empty:
            return []

        # Fuzzy scoring
        candidates = candidates.copy()
        candidates["fuzzy_score"] = candidates["Title"].apply(
            lambda t: fuzz.token_set_ratio(query, str(t)) / 100.0
        )
        candidates["combined_score"] = (
            0.6 * candidates["tfidf_score"] + 0.4 * candidates["fuzzy_score"]
        )

        # Threshold: keep results with any real relevance
        candidates = candidates[candidates["combined_score"] > 0.15].sort_values(
            "combined_score", ascending=False
        )

        return self._group_products(candidates, query)

    # ------------------------------------------------------------------
    # Internals
    # ------------------------------------------------------------------

    def _tfidf_search(self, query: str, category: str, top_k: int) -> pd.DataFrame:
        vec, matrix, idx_list = self.vectorizers[category]
        q_vec = vec.transform([query])
        scores = cosine_similarity(q_vec, matrix)[0]
        n = min(top_k, len(idx_list))
        top_i = np.argsort(scores)[::-1][:n]
        rows = self.df.loc[[idx_list[i] for i in top_i]].copy()
        rows["tfidf_score"] = scores[top_i]
        return rows

    def extract_model(self, title: str) -> str | None:
        title = title.lower()
        for pattern, _ in MODEL_PATTERNS:
            m = re.search(pattern, title)
            if m:
                return _normalize_model(m.group(0))
        return None

    def _group_products(self, df: pd.DataFrame, query: str) -> list[dict]:
        query_model = self.extract_model(query)
        groups: dict[str, dict] = {}

        for _, row in df.iterrows():
            title = str(row.get("Title", ""))
            model = self.extract_model(title)

            # Determine group key
            if model:
                key = model
            elif query_model:
                # For items without a model number but matching the search,
                # use first 5 words as a pseudo-key
                key = " ".join(title.split()[:5])
            else:
                key = " ".join(title.split()[:5])

            score = float(row.get("combined_score", 0))
            price = int(row.get("price_int", 0))
            store = str(row.get("store", ""))
            url = str(row.get("URL", "")) if pd.notna(row.get("URL")) else ""
            img = str(row.get("Image URL", "")) if pd.notna(row.get("Image URL")) else ""
            cat = str(row.get("Category", ""))

            if key not in groups:
                groups[key] = {
                    "model_id": model or key,
                    "canonical_title": title,
                    "category": cat,
                    "score": score,
                    "stores": [],
                }
            else:
                # Update canonical title to best-scored one
                if score > groups[key]["score"]:
                    groups[key]["score"] = score
                    groups[key]["canonical_title"] = title

            # Deduplicate stores — keep cheapest per store
            existing = {s["store"]: s for s in groups[key]["stores"]}
            if store not in existing or price < existing[store]["price"]:
                existing[store] = {
                    "store": store,
                    "title": title,
                    "price": price,
                    "url": url,
                    "image_url": img,
                }
            groups[key]["stores"] = list(existing.values())

        # Post-process
        result = []
        for group in groups.values():
            group["stores"].sort(key=lambda s: s["price"])
            prices = [s["price"] for s in group["stores"] if s["price"] > 0]
            group["min_price"] = min(prices) if prices else 0
            result.append(group)

        result.sort(key=lambda g: (-g["score"], g["min_price"]))
        return result[:25]
