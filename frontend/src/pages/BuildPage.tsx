import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getBuild } from "../api/client";
import BuildSummary from "../components/BuildSummary";
import SearchModal from "../components/SearchModal";
import { useBuildStore } from "../store/buildStore";
import {
  BUILD_CATEGORIES,
  STORE_COLORS,
  type BuildComponent,
  formatPrice,
} from "../types";

export default function BuildPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { build, setBuild, setName, setComponent, removeComponent } =
    useBuildStore();

  const [loadError, setLoadError] = useState(false);
  const [activeCategory, setActiveCategory] = useState<{
    key: string;
    label: string;
  } | null>(null);
  const [editingName, setEditingName] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    getBuild(id)
      .then(setBuild)
      .catch(() => setLoadError(true));
  }, [id, setBuild]);

  useEffect(() => {
    if (editingName) nameInputRef.current?.focus();
  }, [editingName]);

  if (loadError) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-[#6b7280]">Build not found.</p>
          <button
            className="btn-secondary mt-4"
            onClick={() => navigate("/")}
          >
            Back home
          </button>
        </div>
      </div>
    );
  }

  if (!build) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <span className="text-sm text-[#9ca3af]">Loading…</span>
      </div>
    );
  }

  function handleSelectComponent(component: BuildComponent) {
    setComponent(component.category, component);
    setActiveCategory(null);
  }

  const totalPrice = Object.values(build.components)
    .filter(Boolean)
    .reduce((sum, c) => sum + (c?.price ?? 0), 0);

  return (
    <div className="min-h-screen bg-surface">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border-subtle bg-white/95 backdrop-blur-sm px-6 py-3">
        <div className="mx-auto max-w-6xl flex items-center gap-4">
          <button
            className="btn-ghost text-sm"
            onClick={() => navigate("/")}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Home
          </button>

          {/* Editable name */}
          <div className="flex-1 flex items-center gap-2 min-w-0">
            {editingName ? (
              <input
                ref={nameInputRef}
                className="input max-w-xs text-sm font-semibold"
                value={build.name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setEditingName(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === "Escape")
                    setEditingName(false);
                }}
              />
            ) : (
              <button
                className="text-sm font-semibold text-[#1a1a1a] hover:text-accent transition-colors truncate"
                onClick={() => setEditingName(true)}
                title="Click to rename"
              >
                {build.name}
              </button>
            )}
          </div>

          <div className="shrink-0 text-right">
            <p className="text-xs text-[#9ca3af]">Total</p>
            <p className="text-base font-bold text-accent">
              {totalPrice > 0 ? formatPrice(totalPrice) : "—"}
            </p>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto max-w-6xl px-6 py-8 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
        {/* Component slots */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#9ca3af] mb-4">
            Components
          </h2>
          <div className="flex flex-col gap-3">
            {BUILD_CATEGORIES.map(({ key, label }) => {
              const comp = build.components[key];
              return (
                <ComponentSlot
                  key={key}
                  categoryKey={key}
                  label={label}
                  component={comp ?? null}
                  onAdd={() => setActiveCategory({ key, label })}
                  onRemove={() => removeComponent(key)}
                />
              );
            })}
          </div>
        </section>

        {/* Summary sidebar */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#9ca3af] mb-4">
            Summary
          </h2>
          <BuildSummary />
        </section>
      </div>

      {/* Search modal */}
      {activeCategory && (
        <SearchModal
          category={activeCategory.key}
          categoryLabel={activeCategory.label}
          onSelect={handleSelectComponent}
          onClose={() => setActiveCategory(null)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ComponentSlot
// ---------------------------------------------------------------------------

interface SlotProps {
  categoryKey: string;
  label: string;
  component: BuildComponent | null;
  onAdd: () => void;
  onRemove: () => void;
}

function ComponentSlot({
  label,
  component,
  onAdd,
  onRemove,
}: SlotProps) {
  const colors = component
    ? STORE_COLORS[component.store] ?? {
        bg: "bg-gray-50",
        text: "text-gray-600",
        border: "border-gray-200",
      }
    : null;

  if (!component) {
    return (
      <div className="card flex items-center gap-4 px-5 py-4 hover:border-[#1a1a1a] transition-colors group cursor-pointer" onClick={onAdd}>
        <div className="w-28 shrink-0">
          <p className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wide">
            {label}
          </p>
        </div>
        <div className="flex-1" />
        <button
          className="btn-ghost text-sm text-[#9ca3af] group-hover:text-[#1a1a1a]"
          onClick={(e) => { e.stopPropagation(); onAdd(); }}
        >
          + Add {label.toLowerCase()}
        </button>
      </div>
    );
  }

  return (
    <div className="card flex items-center gap-4 px-5 py-4">
      {/* Thumbnail */}
      {component.image_url ? (
        <img
          src={component.image_url}
          alt={component.title}
          className="h-10 w-10 rounded-md object-contain bg-surface border border-border-subtle shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <div className="h-10 w-10 rounded-md bg-surface border border-border-subtle shrink-0" />
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wide mb-0.5">
          {label}
        </p>
        <p
          className="text-sm font-medium text-[#1a1a1a] truncate"
          title={component.title}
        >
          {component.title}
        </p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {colors && (
            <span
              className={`store-badge ${colors.bg} ${colors.text} ${colors.border}`}
            >
              {component.store}
            </span>
          )}
          <span className="text-xs font-semibold text-accent">
            {formatPrice(component.price)}
          </span>
          {component.url && (
            <a
              href={component.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#9ca3af] hover:text-[#1a1a1a] flex items-center gap-0.5 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              View
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
            </a>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          className="btn-ghost text-xs"
          onClick={onAdd}
          title="Change component"
        >
          Change
        </button>
        <button
          className="btn-ghost text-xs text-rose-400 hover:text-rose-600"
          onClick={onRemove}
          title="Remove"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
