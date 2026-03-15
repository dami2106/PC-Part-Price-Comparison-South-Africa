import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { getCommunityBuilds, likeBuild, forkBuild, type CommunitySort } from "../api/client";
import type { CommunityBuild } from "../types";
import { BUILD_CATEGORIES, CATEGORY_CHART_COLORS, formatPrice, formatDate } from "../types";
import { useThemeStore } from "../store/themeStore";

// ── Icons ────────────────────────────────────────────────────────────────────
function HeartIcon({ filled }: { filled?: boolean }) {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
      fill={filled ? "currentColor" : "none"}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}
function ForkIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  );
}
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

// ── Skeleton ─────────────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="card p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-48" />
          <div className="skeleton h-3 w-28" />
        </div>
        <div className="skeleton h-6 w-20 rounded-full" />
      </div>
      <div className="skeleton h-3 w-full" />
      <div className="flex gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton h-5 w-5 rounded-full" />
        ))}
      </div>
      <div className="flex gap-2 pt-1">
        <div className="skeleton h-8 flex-1 rounded-lg" />
        <div className="skeleton h-8 flex-1 rounded-lg" />
      </div>
    </div>
  );
}

// ── Component dots ────────────────────────────────────────────────────────────
function ComponentDots({ components }: { components: Record<string, unknown> }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {BUILD_CATEGORIES.map(({ key, label }) => {
        const filled = !!components[key];
        const color = CATEGORY_CHART_COLORS[key] ?? "#9ca3af";
        return (
          <div
            key={key}
            title={label}
            className="h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-all"
            style={{
              background: filled ? color : "var(--c-border)",
              color: filled ? "#fff" : "var(--c-text-3)",
              opacity: filled ? 1 : 0.5,
            }}
          >
            {key[0]}
          </div>
        );
      })}
    </div>
  );
}

// ── Community Build Card ──────────────────────────────────────────────────────
interface CardProps {
  build: CommunityBuild;
  liked: boolean;
  onLike: () => void;
  onFork: () => void;
  onView: () => void;
}

function CommunityCard({ build, liked, onLike, onFork, onView }: CardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.25 }}
      className="card p-5 flex flex-col gap-3 hover:shadow-lg transition-shadow"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3
            className="text-sm font-bold leading-tight truncate cursor-pointer hover:text-accent transition-colors"
            style={{ color: "var(--c-text-1)" }}
            onClick={onView}
          >
            {build.name}
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--c-text-3)" }}>
            by <span className="font-medium" style={{ color: "var(--c-text-2)" }}>{build.author}</span>
            {" · "}{formatDate(build.published_at)}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-base font-bold text-accent">{formatPrice(build.total_price)}</p>
          <p className="text-[10px]" style={{ color: "var(--c-text-3)" }}>
            {build.component_count} parts
          </p>
        </div>
      </div>

      {/* Description */}
      {build.description && (
        <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "var(--c-text-2)" }}>
          {build.description}
        </p>
      )}

      {/* Component dots */}
      <ComponentDots components={build.components} />

      {/* Component price list — top 4 */}
      <div className="flex flex-col gap-1">
        {BUILD_CATEGORIES
          .filter((c) => build.components[c.key])
          .slice(0, 4)
          .map(({ key, label }) => {
            const comp = build.components[key];
            if (!comp) return null;
            return (
              <div key={key} className="flex items-center justify-between text-xs">
                <span className="truncate" style={{ color: "var(--c-text-2)" }}>
                  <span className="font-medium" style={{ color: "var(--c-text-3)" }}>{label}: </span>
                  {comp.title.length > 35 ? comp.title.slice(0, 35) + "…" : comp.title}
                </span>
                <span className="font-semibold shrink-0 ml-2" style={{ color: "var(--c-text-1)" }}>
                  {formatPrice(comp.price)}
                </span>
              </div>
            );
          })}
        {build.component_count > 4 && (
          <p className="text-xs" style={{ color: "var(--c-text-3)" }}>
            +{build.component_count - 4} more components
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t" style={{ borderColor: "var(--c-border)" }}>
        <button
          onClick={onLike}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            liked
              ? "bg-rose-50 dark:bg-rose-950/40 text-rose-500 border border-rose-200 dark:border-rose-800"
              : "btn-ghost"
          }`}
        >
          <HeartIcon filled={liked} />
          {build.likes}
        </button>

        <button
          onClick={onFork}
          className="btn-ghost flex items-center gap-1.5 text-xs"
        >
          <ForkIcon />
          Fork
        </button>

        <button
          onClick={onView}
          className="btn-secondary ml-auto text-xs px-3 py-1.5"
        >
          View build →
        </button>
      </div>
    </motion.div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
const SORT_OPTIONS: { value: CommunitySort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "liked", label: "Most Liked" },
  { value: "price_asc", label: "Cheapest" },
  { value: "price_desc", label: "Most Expensive" },
];

export default function CommunityPage() {
  const navigate = useNavigate();
  const { dark, toggle } = useThemeStore();
  const [builds, setBuilds] = useState<CommunityBuild[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<CommunitySort>("newest");
  const [likedIds, setLikedIds] = useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem("pc-liked-builds") ?? "[]"));
    } catch {
      return new Set();
    }
  });
  const [forkingId, setForkingId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getCommunityBuilds(sort)
      .then(setBuilds)
      .catch(() => setBuilds([]))
      .finally(() => setLoading(false));
  }, [sort]);

  function persistLikes(ids: Set<string>) {
    localStorage.setItem("pc-liked-builds", JSON.stringify([...ids]));
  }

  async function handleLike(build: CommunityBuild) {
    if (likedIds.has(build.id)) {
      toast("Already liked!", { icon: "❤️" });
      return;
    }
    try {
      const newLikes = await likeBuild(build.id);
      setBuilds((prev) =>
        prev.map((b) => (b.id === build.id ? { ...b, likes: newLikes } : b))
      );
      const updated = new Set(likedIds);
      updated.add(build.id);
      setLikedIds(updated);
      persistLikes(updated);
      toast.success("Liked!", { icon: "❤️" });
    } catch {
      toast.error("Couldn't like build");
    }
  }

  async function handleFork(build: CommunityBuild) {
    setForkingId(build.id);
    try {
      const forked = await forkBuild(build.id);
      toast.success(`Forked "${build.name}" to your builds!`);
      navigate(`/build/${forked.id}`);
    } catch {
      toast.error("Couldn't fork build");
      setForkingId(null);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--c-surface)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b header-blur px-6 py-4"
        style={{ borderColor: "var(--c-border)" }}
      >
        <div className="mx-auto max-w-5xl flex items-center gap-4">
          {/* Nav */}
          <button className="btn-ghost text-sm gap-1.5" onClick={() => navigate("/")}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Home
          </button>

          <div className="flex items-center gap-2">
            <div
              className="h-7 w-7 rounded-md flex items-center justify-center"
              style={{ background: "var(--c-text-1)" }}
            >
              <span className="text-xs font-bold" style={{ color: "var(--c-card)" }}>PC</span>
            </div>
            <span className="text-sm font-bold" style={{ color: "var(--c-text-1)" }}>
              Community Builds
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              className="btn-primary text-sm px-4 py-2 rounded-lg"
              onClick={() => navigate("/")}
            >
              + New build
            </button>
            <button className="btn-ghost rounded-full p-2" onClick={toggle}>
              {dark ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Title + sort */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--c-text-1)" }}>
              Community Builds
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--c-text-2)" }}>
              Builds shared by the community — like, fork, and remix them.
            </p>
          </div>
          <div className="sm:ml-auto flex gap-2 flex-wrap">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSort(opt.value)}
                className="text-xs px-3 py-1.5 rounded-full border font-medium transition-all"
                style={
                  sort === opt.value
                    ? { borderColor: "var(--c-text-1)", color: "var(--c-text-1)", background: "var(--c-card)" }
                    : { borderColor: "var(--c-border)", color: "var(--c-text-3)", background: "transparent" }
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : builds.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div
              className="h-16 w-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "var(--c-card)", border: "1px solid var(--c-border)" }}
            >
              <HeartIcon />
            </div>
            <h2 className="text-lg font-semibold" style={{ color: "var(--c-text-1)" }}>
              No community builds yet
            </h2>
            <p className="text-sm mt-2 max-w-sm" style={{ color: "var(--c-text-2)" }}>
              Be the first to share a build! Create a build and publish it to the community from the build editor.
            </p>
            <button className="btn-primary mt-6 px-6 py-2.5 rounded-xl" onClick={() => navigate("/")}>
              Create a build
            </button>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {builds.map((build, i) => (
                <motion.div
                  key={build.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <CommunityCard
                    build={build}
                    liked={likedIds.has(build.id)}
                    onLike={() => handleLike(build)}
                    onFork={() => handleFork(build)}
                    onView={() => navigate(`/build/${build.id}`)}
                  />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}

        {/* Loading fork overlay */}
        <AnimatePresence>
          {forkingId && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.3)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="card px-8 py-6 flex flex-col items-center gap-3">
                <span className="h-8 w-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                <p className="text-sm font-medium" style={{ color: "var(--c-text-1)" }}>Forking build…</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
