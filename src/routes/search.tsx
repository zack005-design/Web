import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { Masonry } from "@/components/PinCard";
import { CATEGORIES, CREATORS } from "@/lib/data";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>): { q?: string | undefined } => ({ q: typeof s.q === "string" ? s.q : undefined }),
  head: () => ({
    meta: [
      { title: "Search — PixelNest" },
      { name: "description", content: "Search PixelNest for ideas, creators, colors and moods." },
      { property: "og:title", content: "Search — PixelNest" },
      { property: "og:description", content: "Search PixelNest for ideas, creators, colors and moods." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q = "" } = Route.useSearch();
  const navigate = useNavigate();
  const store = useStore();
  const [value, setValue] = useState(q);
  const term = q.toLowerCase();
  const results = term
    ? store.allPins.filter((p) => [p.title, p.category, p.mood, p.color, p.description, ...p.tags].join(" ").toLowerCase().includes(term))
    : [];
  const creators = term ? CREATORS.filter((c) => c.name.toLowerCase().includes(term)) : [];
  const go = (v: string) => { if (!v) return; store.addRecent(v); setValue(v); navigate({ to: "/search", search: { q: v } }); };

  return (
    <div className="pt-6">
      <form onSubmit={(e) => { e.preventDefault(); go(value.trim()); }} className="relative mx-auto max-w-2xl">
        <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input autoFocus value={value} onChange={(e) => setValue(e.target.value)} placeholder="Try “calm interiors” or “gold”" className="h-14 w-full rounded-full bg-secondary pl-12 pr-5 text-base outline-none focus:ring-2 focus:ring-ring/40" />
      </form>

      {!q && (
        <div className="mx-auto mt-10 max-w-2xl space-y-8">
          {store.recent.length > 0 && (
            <div><p className="text-meta mb-3">Recent</p><div className="flex flex-wrap gap-2">{store.recent.map((r) => <button key={r} onClick={() => go(r)} className="chip">{r}</button>)}</div></div>
          )}
          <div><p className="text-meta mb-3">Popular</p><div className="flex flex-wrap gap-2">{CATEGORIES.map((c) => <button key={c} onClick={() => go(c)} className="chip">{c}</button>)}</div></div>
        </div>
      )}

      {q && (
        <div className="mt-8">
          {creators.length > 0 && (
            <div className="mb-8 flex gap-3 overflow-x-auto no-scrollbar">
              {creators.map((c) => (
                <Link key={c.id} to="/creator/$id" params={{ id: c.id }} className="flex items-center gap-3 rounded-full bg-secondary py-1.5 pl-1.5 pr-4">
                  <img src={c.avatar} alt="" className="h-9 w-9 rounded-full" /><span className="text-sm font-medium">{c.name}</span>
                </Link>
              ))}
            </div>
          )}
          <p className="text-meta mb-4">{results.length} ideas for “{q}”</p>
          <Masonry pins={results} />
        </div>
      )}
    </div>
  );
}
