import type { ProductGroup, StoreOption } from "../types";
import { STORE_COLORS, formatPrice } from "../types";

interface Props {
  group: ProductGroup;
  onSelect: (store: StoreOption) => void;
}

export default function ProductGroupCard({ group, onSelect }: Props) {
  const cheapest = group.stores[0];

  return (
    <div className="card px-4 py-4 flex flex-col gap-3">
      {/* Title row */}
      <div className="flex items-start gap-3">
        {cheapest && cheapest.image_url && (
          <img
            src={cheapest.image_url}
            alt={group.canonical_title}
            className="h-12 w-12 rounded-md object-contain bg-surface border border-border-subtle shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#1a1a1a] leading-snug capitalize">
            {group.canonical_title}
          </p>
          <p className="mt-0.5 text-xs text-[#6b7280]">
            {group.category} &middot; From{" "}
            <span className="font-semibold text-accent">
              {formatPrice(group.min_price)}
            </span>{" "}
            &middot; {group.stores.length}{" "}
            {group.stores.length === 1 ? "store" : "stores"}
          </p>
        </div>
      </div>

      {/* Store options */}
      <div className="flex flex-col gap-1.5">
        {group.stores.map((s) => {
          const colors = STORE_COLORS[s.store] ?? {
            bg: "bg-gray-50",
            text: "text-gray-600",
            border: "border-gray-200",
          };
          const isCheapest = s.price === group.min_price;

          return (
            <button
              key={s.store}
              onClick={() => onSelect(s)}
              className={`flex items-center justify-between rounded-md border px-3 py-2.5 transition-all text-left hover:shadow-none group ${
                isCheapest
                  ? "border-accent/30 bg-amber-50/60 hover:border-accent hover:bg-amber-50"
                  : "border-border-subtle bg-surface hover:border-[#1a1a1a] hover:bg-white"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`store-badge ${colors.bg} ${colors.text} ${colors.border} shrink-0`}
                >
                  {s.store}
                </span>
                <span
                  className="text-xs text-[#6b7280] truncate hidden sm:block"
                  title={s.title}
                >
                  {s.title.length > 50 ? s.title.slice(0, 50) + "…" : s.title}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                {isCheapest && (
                  <span className="text-[10px] font-medium text-accent bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
                    Best price
                  </span>
                )}
                <span
                  className={`text-sm font-semibold ${
                    isCheapest ? "text-accent" : "text-[#1a1a1a]"
                  }`}
                >
                  {formatPrice(s.price)}
                </span>
                <svg
                  className="h-3.5 w-3.5 text-[#9ca3af] group-hover:text-[#1a1a1a] transition-colors"
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
