import { createFileRoute, Link } from "@tanstack/react-router";
import { Masonry } from "@/components/PinCard";
import { formatCount, getCreator } from "@/lib/data";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/creator/$id")({
  head: () => ({
    meta: [
      { title: "Creator — PixelNest" },
      { name: "description", content: "See this creator's ideas on PixelNest." },
      { property: "og:title", content: "Creator — PixelNest" },
      { property: "og:description", content: "See this creator's ideas on PixelNest." },
    ],
  }),
  component: CreatorPage,
});

function CreatorPage() {
  const { id } = Route.useParams();
  const store = useStore();
  const c = getCreator(id);
  const following = store.following.includes(c.id);
  const pins = store.allPins.filter((p) => p.creatorId === c.id);
  return (
    <div className="pt-10">
      <div className="flex flex-col items-center text-center">
        <img src={c.avatar} alt="" className="h-24 w-24 rounded-full" />
        <h1 className="mt-4 text-3xl font-semibold">{c.name}</h1>
        <p className="text-meta">@{c.handle}</p>
        <p className="mt-2 text-muted-foreground">{c.bio}</p>
        <p className="mt-2 text-sm">{formatCount(c.followers + (following ? 1 : 0))} followers · {pins.length} ideas</p>
        <div className="mt-5 flex gap-2">
          <button onClick={() => store.toggleFollow(c.id)} className={cn("btn", following ? "btn-ghost" : "btn-primary")}>{following ? "Following" : "Follow"}</button>
          <Link to="/messages" className="btn btn-ghost">Message</Link>
        </div>
      </div>
      <div className="mt-10"><Masonry pins={pins} /></div>
    </div>
  );
}
