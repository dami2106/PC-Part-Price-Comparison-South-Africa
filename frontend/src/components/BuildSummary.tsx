import { useEffect, useRef, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useBuildStore } from "../store/buildStore";
import { BUILD_CATEGORIES, STORE_COLORS, CATEGORY_CHART_COLORS, formatPrice } from "../types";

// ── Animated price counter ────────────────────────────────────────────────────
function AnimatedTotal({ value }: { value: number }) {
  const [displayed, setDisplayed] = useState(value);
  const prevRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const start = prevRef.current;
    const end = value;
    const duration = 500;
    const startTime = performance.now();
    function tick(now: number) {
      const elapsed = now - startTime;
      const p = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplayed(Math.round(start + (end - start) * eased));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    prevRef.current = value;
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [value]);

  return <>{formatPrice(displayed)}</>;
}

// ── Custom pie tooltip ────────────────────────────────────────────────────────
function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { fill: string } }> }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs shadow-xl"
      style={{ background: "var(--c-card)", border: "1px solid var(--c-border)", color: "var(--c-text-1)" }}
    >
      <span className="font-semibold">{item.name}</span>
      <br />
      {formatPrice(item.value)}
    </div>
  );
}

export default function BuildSummary() {
  const build = useBuildStore((s) => s.build);
  const totalPrice = useBuildStore((s) => s.totalPrice);
  const saving = useBuildStore((s) => s.saving);
  const lastSaved = useBuildStore((s) => s.lastSaved);

  if (!build) return null;

  const filledSlots = BUILD_CATEGORIES.filter((cat) => build.components[cat.key]);
  const total = totalPrice();

  // Chart data
  const chartData = filledSlots
    .map(({ key, label }) => {
      const comp = build.components[key];
      if (!comp) return null;
      return {
        name: label,
        value: comp.price,
        fill: CATEGORY_CHART_COLORS[key] ?? "#9ca3af",
      };
    })
    .filter(Boolean) as { name: string; value: number; fill: string }[];

  return (
    <aside className="card flex flex-col divide-y sticky top-24" style={{ borderColor: "var(--c-border)" }}>
      {/* Header */}
      <div className="px-5 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold" style={{ color: "var(--c-text-1)" }}>Build total</h2>
          <span className="text-xs" style={{ color: "var(--c-text-3)" }}>
            {saving ? (
              <span className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                Saving…
              </span>
            ) : lastSaved ? (
              `Saved ${lastSaved.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}`
            ) : ""}
          </span>
        </div>
        <p className="mt-1.5 text-2xl font-bold text-accent">
          {total > 0
            ? <AnimatedTotal value={total} />
            : <span style={{ color: "var(--c-border)" }}>R 0</span>
          }
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--c-text-2)" }}>
          {filledSlots.length} of {BUILD_CATEGORIES.length} components added
        </p>
      </div>

      {/* Pie chart */}
      {chartData.length > 1 && (
        <div className="px-5 py-4">
          <p className="text-xs font-medium mb-3" style={{ color: "var(--c-text-2)" }}>
            Cost breakdown
          </p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
                animationBegin={0}
                animationDuration={600}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} stroke="none" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div className="mt-2 flex flex-col gap-1">
            {chartData.map((item) => {
              const pct = Math.round((item.value / total) * 100);
              return (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full shrink-0" style={{ background: item.fill }} />
                  <span className="text-xs truncate flex-1" style={{ color: "var(--c-text-2)" }}>{item.name}</span>
                  <span className="text-xs font-medium shrink-0" style={{ color: "var(--c-text-3)" }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
                  <p className="text-xs font-medium" style={{ color: "var(--c-text-2)" }}>{label}</p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: "var(--c-text-1)" }} title={comp.title}>
                    {comp.title.length > 40 ? comp.title.slice(0, 40) + "…" : comp.title}
                  </p>
                  <span className={`store-badge mt-1 ${colors.bg} ${colors.text} ${colors.border}`}>
                    {comp.store}
                  </span>
                </div>
                <span className="text-xs font-semibold shrink-0 pt-0.5" style={{ color: "var(--c-text-1)" }}>
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
          <p className="text-xs font-medium mb-2.5" style={{ color: "var(--c-text-2)" }}>Order links</p>
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
                  className="group flex items-center justify-between rounded-lg px-3 py-2 text-xs transition-all hover:shadow-sm"
                  style={{ border: "1px solid var(--c-border)", background: "var(--c-surface)", color: "var(--c-text-1)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--c-text-1)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--c-border)"; }}
                >
                  <span className="truncate font-medium">{label}</span>
                  <span className="flex items-center gap-1 shrink-0 ml-2" style={{ color: "var(--c-text-2)" }}>
                    {comp.store}
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {filledSlots.length === 0 && (
        <div className="px-5 py-8 text-center">
          <p className="text-xs" style={{ color: "var(--c-text-3)" }}>
            Add components to see the breakdown
          </p>
        </div>
      )}
    </aside>
  );
}
