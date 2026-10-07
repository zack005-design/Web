import { createFileRoute, Link } from "@tanstack/react-router";
import { Masonry } from "@/components/PinCard";
import { CATEGORIES, COLORS, MOODS, PINS } from "@/lib/data";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

type S = { category?: string | undefined; color?: string | undefined; mood?: string | undefined };

export const Route = createFileRoute("/explore")({
  validateSearch: (s: Record<string, unknown>): S => ({
    category: typeof s["category"] === "string" ? s["category"] : undefined,
    color: typeof s["color"] === "string" ? s["color"] : undefined,
    mood: typeof s["mood"] === "string" ? s["mood"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Explore — PixelNest" },
      { name: "description", content: "Explore PixelNest ideas by category, color and mood." },
      { property: "og:title", content: "Explore — PixelNest" },
      { property: "og:description", content: "Explore PixelNest ideas by category, color and mood." },
    ],
  }),
  component: Explore,
});

function Explore() {
  const { category, color, mood } = Route.useSearch();
  const store = useStore();
  const filtered = store.allPins.filter((p) => (!category || p.category === category) && (!color || p.color === color) && (!mood || p.mood === mood));
  const active = category || color || mood;

  return (
    <div className="pt-6">
      <h1 className="text-3xl font-semibold md:text-4xl">{active ? [category, color, mood].filter(Boolean).join(" · ") : "Explore"}</h1>
      <p className="mt-1 text-muted-foreground">Browse by what you're looking for — or how you want it to feel.</p>

      {!active && (
        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((c, i) => (
            <Link key={c} to="/explore" search={{ category: c }} data-cursor="image" className="group relative aspect-[4/5] overflow-hidden rounded-2xl">
              <img src={PINS[i + 24]!.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-overlay" />
              <span className="absolute bottom-3 left-3 font-display text-lg font-semibold text-on-image">{c}</span>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-meta w-14">Color</span>
          {COLORS.map((c) => (
            <Link key={c.name} to="/explore" search={(p: S) => ({ ...p, color: p.color === c.name ? undefined : c.name })} className={cn("chip", color === c.name && "chip-active")}>
              <span className="h-3 w-3 rounded-full" style={{ background: c.swatch }} />{c.name}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-meta w-14">Mood</span>
          {MOODS.map((m) => (
            <Link key={m} to="/explore" search={(p: S) => ({ ...p, mood: p.mood === m ? undefined : m })} className={cn("chip", mood === m && "chip-active")}>{m}</Link>
          ))}
          {active && <Link to="/explore" search={{}} className="ml-2 text-sm font-medium text-primary">Clear</Link>}
        </div>
      </div>
      <div className="mt-8"><Masonry pins={filtered} /></div>
    </div>
  );
}
