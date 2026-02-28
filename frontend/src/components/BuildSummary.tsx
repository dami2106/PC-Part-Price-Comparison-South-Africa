import { useBuildStore } from "../store/buildStore";
import { BUILD_CATEGORIES, STORE_COLORS, formatPrice } from "../types";

export default function BuildSummary() {
  const build = useBuildStore((s) => s.build);
  const totalPrice = useBuildStore((s) => s.totalPrice);
  const saving = useBuildStore((s) => s.saving);
  const lastSaved = useBuildStore((s) => s.lastSaved);

  if (!build) return null;

  const filledSlots = BUILD_CATEGORIES.filter(
    (cat) => build.components[cat.key]
  );

  const total = totalPrice();

  return (
    <aside className="card flex flex-col divide-y divide-border-subtle sticky top-6">
      {/* Header */}
      <div className="px-5 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#1a1a1a]">Build total</h2>
          <span className="text-xs text-[#9ca3af]">
            {saving
              ? "Saving…"
              : lastSaved
              ? `Saved ${lastSaved.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}`
              : ""}
          </span>
        </div>
        <p className="mt-1.5 text-2xl font-semibold text-accent">
          {total > 0 ? formatPrice(total) : <span className="text-[#d1d5db]">R 0</span>}
        </p>
        <p className="text-xs text-[#6b7280] mt-0.5">
          {filledSlots.length} of {BUILD_CATEGORIES.length} components added
        </p>
      </div>

      {/* Per-component breakdown */}
      {filledSlots.length > 0 && (
        <div className="px-5 py-3 flex flex-col gap-3">
          {filledSlots.map(({ key, label }) => {
            const comp = build.components[key];
            if (!comp) return null;
            const colors = STORE_COLORS[comp.store] ?? {
              bg: "bg-gray-50",
              text: "text-gray-600",
              border: "border-gray-200",
            };
            return (
              <div key={key} className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#6b7280] font-medium">{label}</p>
                  <p
                    className="text-xs text-[#1a1a1a] mt-0.5 truncate"
                    title={comp.title}
                  >
                    {comp.title.length > 42
                      ? comp.title.slice(0, 42) + "…"
                      : comp.title}
                  </p>
                  <span
                    className={`store-badge mt-1 ${colors.bg} ${colors.text} ${colors.border}`}
                  >
                    {comp.store}
                  </span>
                </div>
                <span className="text-xs font-semibold text-[#1a1a1a] shrink-0 pt-0.5">
                  {formatPrice(comp.price)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Order links */}
      {filledSlots.length > 0 && (
        <div className="px-5 py-4">
          <p className="text-xs font-medium text-[#6b7280] mb-2.5">
            Order links
          </p>
          <div className="flex flex-col gap-1.5">
            {filledSlots.map(({ key, label }) => {
              const comp = build.components[key];
              if (!comp?.url) return null;
              return (
                <a
                  key={key}
                  href={comp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between rounded-md border border-border-subtle bg-surface px-3 py-2 text-xs transition-colors hover:border-[#1a1a1a] hover:bg-white"
                >
                  <span className="truncate text-[#1a1a1a] font-medium">
                    {label}
                  </span>
                  <span className="flex items-center gap-1 text-[#6b7280] group-hover:text-[#1a1a1a] shrink-0 ml-2">
                    {comp.store}
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {filledSlots.length === 0 && (
        <div className="px-5 py-6 text-center">
          <p className="text-xs text-[#9ca3af]">
            Add components to see the breakdown
          </p>
        </div>
      )}
    </aside>
  );
}
