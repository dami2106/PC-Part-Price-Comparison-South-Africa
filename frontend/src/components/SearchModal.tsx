import { useEffect, useRef, useState } from "react";
import { searchProducts } from "../api/client";
import type { BuildComponent, ProductGroup, StoreOption } from "../types";
import ProductGroupCard from "./ProductGroup";

interface Props {
  category: string;
  categoryLabel: string;
  onSelect: (component: BuildComponent) => void;
  onClose: () => void;
}

export default function SearchModal({
  category,
  categoryLabel,
  onSelect,
  onClose,
}: Props) {
  const [query, setQuery] = useState("");
  const [groups, setGroups] = useState<ProductGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
    // Close on Escape
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
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 pt-[10vh] px-4 pb-8 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Panel */}
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl flex flex-col overflow-hidden">
        {/* Search bar */}
        <div className="px-5 py-4 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                ref={inputRef}
                type="text"
                className="input pl-9"
                placeholder={`Search ${categoryLabel}… e.g. "rtx 4070" or "ryzen 5 5600x"`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button className="btn-ghost shrink-0" onClick={onClose}>
              Cancel
            </button>
          </div>
          {query && (
            <p className="mt-2 text-xs text-[#9ca3af]">
              Showing results in{" "}
              <span className="font-medium text-[#6b7280]">{categoryLabel}</span>{" "}
              across all 7 stores
            </p>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3 max-h-[65vh]">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <span className="text-sm text-[#9ca3af]">Searching…</span>
            </div>
          )}

          {!loading && !query && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm font-medium text-[#1a1a1a]">
                Search for a {categoryLabel.toLowerCase()}
              </p>
              <p className="mt-1 text-xs text-[#9ca3af]">
                Type a model name, spec, or brand to compare prices
              </p>
            </div>
          )}

          {!loading && searched && groups.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-[#6b7280]">No results for "{query}"</p>
              <p className="mt-1 text-xs text-[#9ca3af]">
                Try a shorter search or different keywords
              </p>
            </div>
          )}

          {!loading &&
            groups.map((group) => (
              <ProductGroupCard
                key={group.model_id + group.canonical_title}
                group={group}
                onSelect={(store) => handleSelect(group, store)}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
