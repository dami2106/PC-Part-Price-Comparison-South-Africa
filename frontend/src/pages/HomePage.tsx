import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createBuild, deleteBuild, listBuilds } from "../api/client";
import type { BuildSummary } from "../types";
import { formatDate, formatPrice } from "../types";

export default function HomePage() {
  const navigate = useNavigate();
  const [builds, setBuilds] = useState<BuildSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    listBuilds()
      .then(setBuilds)
      .catch(() => setBuilds([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleNewBuild() {
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
    await deleteBuild(id);
    setBuilds((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <header className="border-b border-border-subtle bg-white px-6 py-4">
        <div className="mx-auto max-w-3xl flex items-center gap-3">
          <div className="h-7 w-7 rounded-md bg-[#1a1a1a] flex items-center justify-center">
            <span className="text-white text-xs font-bold">PC</span>
          </div>
          <span className="text-sm font-medium text-[#1a1a1a]">
            PC Parts — South Africa
          </span>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="w-full max-w-xl text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-[#1a1a1a]">
            Build your PC
          </h1>
          <p className="mt-3 text-[#6b7280] text-base">
            Compare prices across 7 South African retailers and configure your
            ideal build.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              className="btn-primary text-base px-6 py-3"
              onClick={handleNewBuild}
              disabled={creating}
            >
              {creating ? "Creating…" : "New build"}
            </button>

            {!loading && builds.length > 0 && (
              <button
                className="btn-secondary text-base px-6 py-3"
                onClick={() => setShowSaved((v) => !v)}
              >
                {showSaved ? "Hide saved" : `Continue build (${builds.length})`}
              </button>
            )}
          </div>

          {/* Saved builds list */}
          {showSaved && builds.length > 0 && (
            <div className="mt-8 card divide-y divide-border-subtle overflow-hidden text-left">
              {builds.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-surface transition-colors group"
                  onClick={() => navigate(`/build/${b.id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1a1a1a] truncate">
                      {b.name}
                    </p>
                    <p className="text-xs text-[#6b7280] mt-0.5">
                      Updated {formatDate(b.updated_at)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-accent shrink-0">
                    {formatPrice(b.total_price)}
                  </span>
                  <button
                    className="btn-ghost text-xs opacity-0 group-hover:opacity-100 shrink-0"
                    onClick={(e) => handleDelete(b.id, e)}
                    title="Delete build"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}

          {!loading && builds.length === 0 && (
            <p className="mt-8 text-sm text-[#9ca3af]">
              No saved builds yet. Start by creating a new one.
            </p>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-[#9ca3af]">
        Prices updated from Wootware, Evetech, DreamWareTech, Rebeltech,
        Progenix, Titanice & Takealot
      </footer>
    </div>
  );
}
