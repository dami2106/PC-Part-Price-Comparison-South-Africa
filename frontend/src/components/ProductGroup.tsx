import type { ProductGroup, StoreOption } from "../types";
import { STORE_COLORS, formatPrice } from "../types";

interface Props {
  group: ProductGroup;
  onSelect: (store: StoreOption) => void;
}

export default function ProductGroupCard({ group, onSelect }: Props) {
  const cheapest = group.stores[0];

  return (
    <div
      className="card px-4 py-4 flex flex-col gap-3 hover:shadow-md transition-shadow"
      style={{ borderColor: "var(--c-border)" }}
    >
      {/* Title row */}
      <div className="flex items-start gap-3">
        {cheapest?.image_url && (
          <img
            src={cheapest.image_url}
            alt={group.canonical_title}
            className="h-12 w-12 rounded-lg object-contain shrink-0"
            style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)" }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold capitalize leading-snug" style={{ color: "var(--c-text-1)" }}>
            {group.canonical_title}
          </p>
          <p className="mt-0.5 text-xs" style={{ color: "var(--c-text-2)" }}>
            {group.category} &middot; From{" "}
            <span className="font-bold text-accent">{formatPrice(group.min_price)}</span>
            {" "}&middot; {group.stores.length} {group.stores.length === 1 ? "store" : "stores"}
          </p>
        </div>
      </div>

      {/* Store options */}
      <div className="flex flex-col gap-1.5">
        {group.stores.map((s) => {
          const colors = STORE_COLORS[s.store] ?? {
            bg: "bg-gray-50 dark:bg-gray-900/40",
            text: "text-gray-600 dark:text-gray-300",
            border: "border-gray-200 dark:border-gray-700",
          };
          const isCheapest = s.price === group.min_price;

          return (
            <button
              key={s.store}
              onClick={() => onSelect(s)}
              className={`flex items-center justify-between rounded-lg border px-3 py-2.5 transition-all text-left group ${
                isCheapest
                  ? "border-amber-200 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-950/30 hover:border-accent hover:bg-amber-50 dark:hover:bg-amber-950/50"
                  : ""
              }`}
              style={
                !isCheapest
                  ? {
                      borderColor: "var(--c-border)",
                      background: "var(--c-surface)",
                    }
                  : {}
              }
              onMouseEnter={(e) => {
                if (!isCheapest) {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--c-text-1)";
                  (e.currentTarget as HTMLElement).style.background = "var(--c-card)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isCheapest) {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--c-border)";
                  (e.currentTarget as HTMLElement).style.background = "var(--c-surface)";
                }
              }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className={`store-badge ${colors.bg} ${colors.text} ${colors.border} shrink-0`}>
                  {s.store}
                </span>
                <span
                  className="text-xs truncate hidden sm:block"
                  style={{ color: "var(--c-text-2)" }}
                  title={s.title}
                >
                  {s.title.length > 48 ? s.title.slice(0, 48) + "…" : s.title}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                {isCheapest && (
                  <span className="text-[10px] font-semibold text-accent bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-full px-2 py-0.5">
                    Best
                  </span>
                )}
                <span className={`text-sm font-bold ${isCheapest ? "text-accent" : ""}`} style={!isCheapest ? { color: "var(--c-text-1)" } : {}}>
                  {formatPrice(s.price)}
                </span>
                <svg
                  className="h-3.5 w-3.5 transition-colors"
                  style={{ color: "var(--c-text-3)" }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
