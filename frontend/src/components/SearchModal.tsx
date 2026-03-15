import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { searchProducts } from "../api/client";
import type { BuildComponent, ProductGroup, StoreOption } from "../types";
import ProductGroupCard from "./ProductGroup";

type SortOrder = "relevance" | "price-asc" | "price-desc";

interface Props {
  category: string;
  categoryLabel: string;
  onSelect: (component: BuildComponent) => void;
  onClose: () => void;
}

export default function SearchModal({ category, categoryLabel, onSelect, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [groups, setGroups] = useState<ProductGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [sort, setSort] = useState<SortOrder>("relevance");
  const [storeFilter, setStoreFilter] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setGroups([]);
      setSearched(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchProducts(query.trim(), category);
        setGroups(results);
        setSearched(true);
      } catch {
        setGroups([]);
        setSearched(true);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [query, category]);

  // All stores available in current results
  const allStores = Array.from(
    new Set(groups.flatMap((g) => g.stores.map((s) => s.store)))
  ).sort();

  function toggleStore(store: string) {
    setStoreFilter((prev) =>
      prev.includes(store) ? prev.filter((s) => s !== store) : [...prev, store]
    );
  }

  // Apply filters + sort
  const displayed = groups
    .map((g) => {
      if (storeFilter.length === 0) return g;
      const filtered = g.stores.filter((s) => storeFilter.includes(s.store));
      if (filtered.length === 0) return null;
      return { ...g, stores: filtered, min_price: Math.min(...filtered.map((s) => s.price)) };
    })
    .filter(Boolean) as ProductGroup[];

  const sorted = [...displayed].sort((a, b) => {
    if (sort === "price-asc") return a.min_price - b.min_price;
    if (sort === "price-desc") return b.min_price - a.min_price;
    return 0; // relevance = original order
  });

  function handleSelect(group: ProductGroup, store: StoreOption) {
    onSelect({
      category,
      title: store.title,
      store: store.store,
      price: store.price,
      url: store.url,
      image_url: store.image_url,
    });
    onClose();
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh] px-4 pb-8 overflow-y-auto"
      style={{ background: "rgba(0,0,0,0.4)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        className="w-full max-w-2xl rounded-2xl flex flex-col overflow-hidden shadow-2xl"
        style={{ background: "var(--c-card)", maxHeight: "85vh" }}
        initial={{ opacity: 0, scale: 0.96, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {/* Search bar */}
        <div className="px-5 py-4 border-b" style={{ borderColor: "var(--c-border)" }}>
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                style={{ color: "var(--c-text-3)" }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                className="input pl-9"
                placeholder={`Search ${categoryLabel}… e.g. "rtx 4070" or "ryzen 5 5600x"`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors"
                  style={{ color: "var(--c-text-3)" }}
                  onClick={() => setQuery("")}
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <button className="btn-ghost shrink-0 text-sm" onClick={onClose}>
              Cancel
            </button>
          </div>

          {/* Filter + sort bar */}
          <AnimatePresence>
            {searched && sorted.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  {/* Store filters */}
                  {allStores.map((store) => (
                    <button
                      key={store}
                      onClick={() => toggleStore(store)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-all font-medium ${
                        storeFilter.includes(store)
                          ? "border-accent bg-amber-50 dark:bg-amber-950/30 text-accent"
                          : ""
                      }`}
                      style={
                        !storeFilter.includes(store)
                          ? { borderColor: "var(--c-border)", color: "var(--c-text-2)", background: "var(--c-surface)" }
                          : {}
                      }
                    >
                      {store}
                    </button>
                  ))}

                  <div className="ml-auto flex items-center gap-1">
                    {(["relevance", "price-asc", "price-desc"] as SortOrder[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => setSort(s)}
                        className="text-xs px-2.5 py-1 rounded-full border transition-all font-medium"
                        style={
                          sort === s
                            ? { borderColor: "var(--c-text-1)", color: "var(--c-text-1)", background: "var(--c-surface)" }
                            : { borderColor: "var(--c-border)", color: "var(--c-text-3)", background: "transparent" }
                        }
                      >
                        {s === "relevance" ? "Relevance" : s === "price-asc" ? "↑ Price" : "↓ Price"}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {query && (
            <p className="mt-2 text-xs" style={{ color: "var(--c-text-3)" }}>
              {searched && !loading
                ? `${sorted.length} result${sorted.length !== 1 ? "s" : ""} in `
                : "Searching in "}
              <span className="font-medium" style={{ color: "var(--c-text-2)" }}>{categoryLabel}</span>
            </p>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
          {/* Loading skeletons */}
          {loading && (
            <div className="flex flex-col gap-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card px-4 py-4 flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className="skeleton h-12 w-12 rounded-md shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton h-3.5 w-3/4" />
                      <div className="skeleton h-3 w-1/2" />
                    </div>
                  </div>
                  <div className="skeleton h-10 w-full rounded-md" />
                  <div className="skeleton h-10 w-full rounded-md" />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && !query && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "var(--c-surface)" }}>
                <svg className="h-7 w-7" style={{ color: "var(--c-text-3)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-sm font-semibold" style={{ color: "var(--c-text-1)" }}>
                Search for a {categoryLabel.toLowerCase()}
              </p>
              <p className="mt-1 text-xs" style={{ color: "var(--c-text-3)" }}>
                Type a model name, spec, or brand to compare prices across all 7 stores
              </p>
            </div>
          )}

          {/* No results */}
          {!loading && searched && sorted.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm font-medium" style={{ color: "var(--c-text-2)" }}>No results for "{query}"</p>
              <p className="mt-1 text-xs" style={{ color: "var(--c-text-3)" }}>
                Try a shorter search or different keywords
              </p>
            </div>
          )}

          {/* Results with stagger */}
          {!loading &&
            sorted.map((group, i) => (
              <motion.div
                key={group.model_id + group.canonical_title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.2 }}
              >
                <ProductGroupCard
                  group={group}
                  onSelect={(store) => handleSelect(group, store)}
                />
              </motion.div>
            ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
