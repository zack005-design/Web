import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { getCreator } from "@/lib/data";
import { timeAgo, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — PixelNest" },
      { name: "description", content: "Your latest PixelNest activity." },
      { property: "og:title", content: "Notifications — PixelNest" },
      { property: "og:description", content: "Your latest PixelNest activity." },
    ],
  }),
  component: Notifications,
});

function Notifications() {
  const store = useStore();
  useEffect(() => {
    const t = setTimeout(store.markAllRead, 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="mx-auto max-w-2xl pt-8">
      <h1 className="text-3xl font-semibold">Notifications</h1>
      <div className="mt-6 divide-y">
        {store.notifs.map((n) => {
          const pin = n.pinId ? store.getPin(n.pinId) : undefined;
          const c = n.creatorId ? getCreator(n.creatorId) : undefined;
          const body = (
            <div className="flex items-center gap-4 py-4">
              {c ? <img src={c.avatar} alt="" className="h-11 w-11 rounded-full" /> : pin ? <img src={pin.image} alt="" className="h-11 w-11 rounded-xl object-cover" /> : <span className="h-11 w-11 rounded-full bg-secondary" />}
              <p className={cn("flex-1 text-sm", !n.read && "font-semibold")}>{n.text}</p>
              <span className="text-meta">{timeAgo(n.at)}</span>
              {!n.read && <span className="h-2 w-2 rounded-full bg-primary" />}
            </div>
          );
          return pin ? <Link key={n.id} to="/pin/$id" params={{ id: pin.id }} className="block">{body}</Link> : c ? <Link key={n.id} to="/creator/$id" params={{ id: c.id }} className="block">{body}</Link> : <div key={n.id}>{body}</div>;
        })}
      </div>
    </div>
  );
}
