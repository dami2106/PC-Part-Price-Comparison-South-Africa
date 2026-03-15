import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { getBuild, publishBuild, unpublishBuild } from "../api/client";
import BuildSummaryPanel from "../components/BuildSummary";
import SearchModal from "../components/SearchModal";
import { useBuildStore } from "../store/buildStore";
import { useThemeStore } from "../store/themeStore";
import {
  BUILD_CATEGORIES,
  STORE_COLORS,
  type BuildComponent,
  formatPrice,
} from "../types";

// ── Icons ───────────────────────────────────────────────────────────────────
function SunIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  );
}
function ShareIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  );
}

// ── Animated price counter ────────────────────────────────────────────────────
function AnimatedPrice({ value }: { value: number }) {
  const [displayed, setDisplayed] = useState(value);
  const prevRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const start = prevRef.current;
    const end = value;
    const duration = 450;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(start + (end - start) * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    prevRef.current = value;
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value]);

  return <>{formatPrice(displayed)}</>;
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function ProgressBar({ filled, total }: { filled: number; total: number }) {
  const pct = Math.round((filled / total) * 100);
  const complete = filled === total;

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--c-border)" }}>
        <motion.div
          className={`h-full rounded-full ${complete ? "bg-green-500" : "bg-accent"}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
      <span className="text-xs font-medium shrink-0" style={{ color: complete ? "#22c55e" : "var(--c-text-3)" }}>
        {filled}/{total}
      </span>
      <AnimatePresence>
        {complete && (
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="text-xs font-semibold text-green-500"
          >
            Complete! 🎉
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Publish Modal ─────────────────────────────────────────────────────────────
interface PublishModalProps {
  buildId: string;
  isPublished: boolean;
  onClose: () => void;
  onPublished: () => void;
  onUnpublished: () => void;
}

function PublishModal({ buildId, isPublished, onClose, onPublished, onUnpublished }: PublishModalProps) {
  const navigate = useNavigate();
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  async function handlePublish() {
    setBusy(true);
    try {
      await publishBuild(buildId, author || "Anonymous", description);
      toast.success("Build published to the community! 🎉");
      onPublished();
      onClose();
    } catch {
      toast.error("Failed to publish");
    } finally {
      setBusy(false);
    }
  }

  async function handleUnpublish() {
    setBusy(true);
    try {
      await unpublishBuild(buildId);
      toast("Build removed from community");
      onUnpublished();
      onClose();
    } catch {
      toast.error("Failed to unpublish");
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.4)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        className="card w-full max-w-md p-6 flex flex-col gap-5"
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        {isPublished ? (
          <>
            <div>
              <h2 className="text-base font-bold" style={{ color: "var(--c-text-1)" }}>Already published</h2>
              <p className="text-sm mt-1" style={{ color: "var(--c-text-2)" }}>
                This build is live on the community page.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                className="btn-secondary flex-1 text-sm py-2.5"
                onClick={() => { onClose(); navigate("/community"); }}
              >
                View in Community
              </button>
              <button
                className="btn-ghost text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                onClick={handleUnpublish}
                disabled={busy}
              >
                {busy ? "…" : "Unpublish"}
              </button>
            </div>
            <button className="btn-ghost text-sm text-center" onClick={onClose}>Cancel</button>
          </>
        ) : (
          <>
            <div>
              <h2 className="text-base font-bold" style={{ color: "var(--c-text-1)" }}>
                Publish to Community
              </h2>
              <p className="text-sm mt-1" style={{ color: "var(--c-text-2)" }}>
                Share your build so others can view, like, and fork it.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--c-text-2)" }}>
                  Your name <span style={{ color: "var(--c-text-3)" }}>(optional)</span>
                </label>
                <input
                  className="input"
                  placeholder="Anonymous"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  maxLength={40}
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--c-text-2)" }}>
                  Description <span style={{ color: "var(--c-text-3)" }}>(optional)</span>
                </label>
                <textarea
                  className="input resize-none"
                  rows={3}
                  placeholder="Great 1080p gaming build, stays under R15k…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={200}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button className="btn-ghost flex-1 text-sm" onClick={onClose}>Cancel</button>
              <button
                className="btn-primary flex-1 text-sm py-2.5"
                onClick={handlePublish}
                disabled={busy}
              >
                {busy ? (
                  <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                ) : "Publish Build 🚀"}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── Build page ────────────────────────────────────────────────────────────────
export default function BuildPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { dark, toggle } = useThemeStore();
  const { build, setBuild, setName, setComponent, removeComponent } = useBuildStore();

  const [loadError, setLoadError] = useState(false);
  const [activeCategory, setActiveCategory] = useState<{ key: string; label: string } | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    getBuild(id)
      .then((b) => {
        setBuild(b);
        setIsPublished(!!(b as unknown as Record<string, unknown>).published);
      })
      .catch(() => setLoadError(true));
  }, [id, setBuild]);

  useEffect(() => {
    if (editingName) nameInputRef.current?.focus();
  }, [editingName]);

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--c-surface)" }}>
        <div className="text-center">
          <p className="text-sm" style={{ color: "var(--c-text-2)" }}>Build not found.</p>
          <button className="btn-secondary mt-4" onClick={() => navigate("/")}>Back home</button>
        </div>
      </div>
    );
  }

  if (!build) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--c-surface)" }}>
        <div className="flex flex-col gap-4 w-full max-w-2xl px-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card px-5 py-4 flex items-center gap-4">
              <div className="skeleton h-10 w-10 rounded-md shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-3 w-24" />
                <div className="skeleton h-3.5 w-48" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const filledCount = BUILD_CATEGORIES.filter((c) => build.components[c.key]).length;
  const totalPrice = Object.values(build.components)
    .filter(Boolean)
    .reduce((sum, c) => sum + (c?.price ?? 0), 0);

  function handleSelectComponent(component: BuildComponent) {
    const isChange = !!build?.components[component.category];
    setComponent(component.category, component);
    setActiveCategory(null);
    toast.success(
      isChange
        ? `Changed ${component.category}`
        : `Added ${component.category}`,
      { icon: "✓" }
    );
  }

  function handleRemove(key: string, label: string) {
    removeComponent(key);
    toast(`Removed ${label}`, { icon: "×" });
  }

  function handleShare() {
    if (!build) return;
    const text = [
      `🖥️ ${build.name}`,
      `Total: ${formatPrice(totalPrice)}`,
      "",
      ...BUILD_CATEGORIES
        .filter((c) => build.components[c.key])
        .map((c) => {
          const comp = build.components[c.key]!;
          return `${c.label}: ${comp.title} — ${formatPrice(comp.price)} (${comp.store})`;
        }),
    ].join("\n");

    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("Build copied to clipboard!"))
      .catch(() => toast.error("Couldn't copy to clipboard"));
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--c-surface)" }}>
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b header-blur px-6 py-3" style={{ borderColor: "var(--c-border)" }}>
        <div className="mx-auto max-w-6xl flex items-center gap-4">
          <button className="btn-ghost text-sm gap-1.5" onClick={() => navigate("/")}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
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
                  if (e.key === "Enter" || e.key === "Escape") setEditingName(false);
                }}
              />
            ) : (
              <button
                className="text-sm font-semibold hover:text-accent transition-colors truncate flex items-center gap-1.5"
                style={{ color: "var(--c-text-1)" }}
                onClick={() => setEditingName(true)}
                title="Click to rename"
              >
                {build.name}
                <svg className="h-3 w-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              className="btn-ghost text-sm gap-1.5"
              onClick={() => navigate("/community")}
              title="Community builds"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="hidden sm:inline">Community</span>
            </button>
            {filledCount > 0 && (
              <button
                className={`text-sm gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all flex items-center ${
                  isPublished
                    ? "bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800"
                    : "btn-secondary"
                }`}
                onClick={() => setShowPublish(true)}
                title={isPublished ? "Published to community" : "Publish to community"}
              >
                {isPublished ? (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="hidden sm:inline">Published</span>
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="hidden sm:inline">Publish</span>
                  </>
                )}
              </button>
            )}
            {totalPrice > 0 && (
              <button className="btn-ghost text-sm gap-1.5" onClick={handleShare} title="Copy build summary">
                <ShareIcon />
                <span className="hidden sm:inline">Share</span>
              </button>
            )}
            <button className="btn-ghost rounded-full p-2" onClick={toggle} title="Toggle theme">
              {dark ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>

          {/* Total */}
          <div className="shrink-0 text-right">
            <p className="text-xs" style={{ color: "var(--c-text-3)" }}>Total</p>
            <p className="text-base font-bold text-accent">
              {totalPrice > 0 ? <AnimatedPrice value={totalPrice} /> : "—"}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="mx-auto max-w-6xl mt-2">
          <ProgressBar filled={filledCount} total={BUILD_CATEGORIES.length} />
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto max-w-6xl px-6 py-8 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
        {/* Component slots */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--c-text-3)" }}>
            Components
          </h2>
          <div className="flex flex-col gap-3">
            {BUILD_CATEGORIES.map(({ key, label, icon }, i) => {
              const comp = build.components[key];
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.25 }}
                >
                  <ComponentSlot
                    categoryKey={key}
                    label={label}
                    icon={icon}
                    component={comp ?? null}
                    onAdd={() => setActiveCategory({ key, label })}
                    onRemove={() => handleRemove(key, label)}
                  />
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Summary sidebar */}
        <aside>
          <h2 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--c-text-3)" }}>
            Summary
          </h2>
          <BuildSummaryPanel />
        </aside>
      </div>

      {/* Search modal */}
      <AnimatePresence>
        {activeCategory && (
          <SearchModal
            category={activeCategory.key}
            categoryLabel={activeCategory.label}
            onSelect={handleSelectComponent}
            onClose={() => setActiveCategory(null)}
          />
        )}
      </AnimatePresence>

      {/* Publish modal */}
      <AnimatePresence>
        {showPublish && build && (
          <PublishModal
            buildId={build.id}
            isPublished={isPublished}
            onClose={() => setShowPublish(false)}
            onPublished={() => setIsPublished(true)}
            onUnpublished={() => setIsPublished(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── ComponentSlot ─────────────────────────────────────────────────────────────
interface SlotProps {
  categoryKey: string;
  label: string;
  icon: string;
  component: BuildComponent | null;
  onAdd: () => void;
  onRemove: () => void;
}

function ComponentSlot({ label, icon, component, onAdd, onRemove }: SlotProps) {
  const colors = component
    ? STORE_COLORS[component.store] ?? {
        bg: "bg-gray-50 dark:bg-gray-900/40",
        text: "text-gray-600 dark:text-gray-300",
        border: "border-gray-200 dark:border-gray-700",
      }
    : null;

  const CategoryIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      {icon.split(" M").map((d, i) => (
        <path key={i} strokeLinecap="round" strokeLinejoin="round" d={i === 0 ? d : "M" + d} />
      ))}
    </svg>
  );

  if (!component) {
    return (
      <button
        className="card w-full flex items-center gap-4 px-5 py-4 text-left group transition-all hover:scale-[1.005] hover:shadow-sm"
        style={{ cursor: "pointer" }}
        onClick={onAdd}
      >
        <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 transition-colors" style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)" }}>
          <span style={{ color: "var(--c-text-3)" }}>
            <CategoryIcon />
          </span>
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--c-text-3)" }}>
            {label}
          </p>
        </div>
        <span className="text-sm transition-colors" style={{ color: "var(--c-text-3)" }}>
          <span className="group-hover:text-accent group-hover:underline transition-colors">
            + Add {label.toLowerCase()}
          </span>
        </span>
      </button>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={component.title + component.store}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        className="card flex items-center gap-4 px-5 py-4 hover:shadow-sm transition-shadow"
      >
        {/* Thumbnail or icon */}
        {component.image_url ? (
          <img
            src={component.image_url}
            alt={component.title}
            className="h-10 w-10 rounded-lg object-contain shrink-0"
            style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)" }}
            onError={(e) => {
              const el = e.target as HTMLImageElement;
              el.style.display = "none";
              el.nextElementSibling?.removeAttribute("style");
            }}
          />
        ) : null}
        <div
          className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
          style={{
            background: "var(--c-surface)",
            border: "1px solid var(--c-border)",
            display: component.image_url ? "none" : "flex",
          }}
        >
          <span style={{ color: "var(--c-text-3)" }}><CategoryIcon /></span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "var(--c-text-3)" }}>
            {label}
          </p>
          <p className="text-sm font-medium truncate" style={{ color: "var(--c-text-1)" }} title={component.title}>
            {component.title}
          </p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {colors && (
              <span className={`store-badge ${colors.bg} ${colors.text} ${colors.border}`}>
                {component.store}
              </span>
            )}
            <span className="text-xs font-bold text-accent">
              {formatPrice(component.price)}
            </span>
            {component.url && (
              <a
                href={component.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs flex items-center gap-0.5 transition-colors hover:text-accent"
                style={{ color: "var(--c-text-3)" }}
                onClick={(e) => e.stopPropagation()}
              >
                View
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button className="btn-ghost text-xs" onClick={onAdd}>Change</button>
          <button
            className="btn-ghost text-xs"
            style={{ color: "#f87171" }}
            onClick={onRemove}
          >
            Remove
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
