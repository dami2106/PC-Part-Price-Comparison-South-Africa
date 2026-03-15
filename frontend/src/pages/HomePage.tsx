import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { createBuild, deleteBuild, listBuilds } from "../api/client";
import type { BuildSummary } from "../types";
import { formatDate, formatPrice } from "../types";
import { useThemeStore } from "../store/themeStore";

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
function TrashIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

// ── Skeleton ─────────────────────────────────────────────────────────────────
function BuildSkeleton() {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <div className="flex-1 min-w-0 space-y-2">
        <div className="skeleton h-3.5 w-36" />
        <div className="skeleton h-2.5 w-24" />
      </div>
      <div className="skeleton h-4 w-20 shrink-0" />
    </div>
  );
}

// ── Stats badges ─────────────────────────────────────────────────────────────
const STATS = [
  { label: "Retailers", value: "7" },
  { label: "Products", value: "14k+" },
  { label: "Categories", value: "11" },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { dark, toggle } = useThemeStore();
  const [builds, setBuilds] = useState<BuildSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    listBuilds()
      .then(setBuilds)
      .catch(() => setBuilds([]))
      .finally(() => setLoading(false));
  }, []);

  // Keyboard shortcut: N = new build
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (
        e.key === "n" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !(e.target as HTMLElement).matches("input, textarea")
      ) {
        handleNewBuild();
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  async function handleNewBuild() {
    if (creating) return;
    setCreating(true);
    try {
      const build = await createBuild("My Build");
      navigate(`/build/${build.id}`);
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setDeletingId(id);
    await deleteBuild(id);
    setBuilds((prev) => prev.filter((b) => b.id !== id));
    setDeletingId(null);
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--c-surface)" }}>
      {/* Header */}
      <header className="border-b px-6 py-4 header-blur sticky top-0 z-10" style={{ borderColor: "var(--c-border)" }}>
        <div className="mx-auto max-w-3xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-md flex items-center justify-center" style={{ background: "var(--c-text-1)" }}>
              <span className="text-xs font-bold" style={{ color: "var(--c-card)" }}>PC</span>
            </div>
            <span className="text-sm font-semibold" style={{ color: "var(--c-text-1)" }}>
              PC Parts SA
            </span>
          </div>
          <button
            className="btn-ghost text-sm gap-1.5"
            onClick={() => navigate("/community")}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Community
          </button>
          <button
            className="btn-ghost rounded-full p-2"
            onClick={toggle}
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl">
          {/* Stats */}
          <motion.div
            className="flex justify-center gap-8 mb-10"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold text-accent">{s.value}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--c-text-3)" }}>{s.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Headline */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            <h1 className="text-4xl font-bold tracking-tight" style={{ color: "var(--c-text-1)" }}>
              Build your perfect PC
            </h1>
            <p className="mt-3 text-base" style={{ color: "var(--c-text-2)" }}>
              Compare prices across 7 South African retailers and find the best
              deals on every component.
            </p>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <button
              className="btn-primary text-base px-7 py-3 rounded-xl font-semibold shadow-sm"
              onClick={handleNewBuild}
              disabled={creating}
            >
              {creating ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  New build
                  <span className="ml-1 text-xs opacity-50 hidden sm:inline">N</span>
                </>
              )}
            </button>

            {!loading && builds.length > 0 && (
              <button
                className="btn-secondary text-base px-7 py-3 rounded-xl font-semibold"
                onClick={() => setShowSaved((v) => !v)}
              >
                {showSaved ? "Hide builds" : `My builds (${builds.length})`}
              </button>
            )}
          </motion.div>

          {/* Saved builds */}
          <AnimatePresence>
            {showSaved && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="card divide-y overflow-hidden" style={{ borderColor: "var(--c-border)" }}>
                  {loading ? (
                    <>
                      <BuildSkeleton />
                      <BuildSkeleton />
                    </>
                  ) : builds.length === 0 ? (
                    <p className="text-center text-sm py-8" style={{ color: "var(--c-text-3)" }}>
                      No saved builds yet.
                    </p>
                  ) : (
                    builds.map((b, i) => (
                      <motion.div
                        key={b.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 8 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex items-center gap-4 px-5 py-4 cursor-pointer group transition-colors hover:bg-surface"
                        style={{ "--tw-bg-opacity": 1 } as React.CSSProperties}
                        onClick={() => navigate(`/build/${b.id}`)}
                      >
                        {/* Build icon */}
                        <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)" }}>
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: "var(--c-text-3)" }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
                          </svg>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: "var(--c-text-1)" }}>
                            {b.name}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: "var(--c-text-3)" }}>
                            Updated {formatDate(b.updated_at)}
                          </p>
                        </div>

                        <span className="text-sm font-bold text-accent shrink-0">
                          {b.total_price > 0 ? formatPrice(b.total_price) : "Empty"}
                        </span>

                        <button
                          className="btn-ghost text-xs opacity-0 group-hover:opacity-100 shrink-0 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-1.5 rounded-lg transition-all"
                          onClick={(e) => handleDelete(b.id, e)}
                          disabled={deletingId === b.id}
                          title="Delete build"
                        >
                          {deletingId === b.id ? (
                            <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin block" />
                          ) : (
                            <TrashIcon />
                          )}
                        </button>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading state before button shown */}
          {loading && !showSaved && (
            <motion.div
              className="mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="card divide-y overflow-hidden">
                <BuildSkeleton />
                <BuildSkeleton />
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs" style={{ color: "var(--c-text-3)" }}>
        Prices from Wootware · Evetech · DreamWareTech · Rebeltech · Progenix · Titanice · Takealot
      </footer>
    </div>
  );
}
