import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { CREATORS, getCreator } from "@/lib/data";
import { timeAgo, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/messages")({
  head: () => ({
    meta: [
      { title: "Messages — PixelNest" },
      { name: "description", content: "Chat with creators on PixelNest." },
      { property: "og:title", content: "Messages — PixelNest" },
      { property: "og:description", content: "Chat with creators on PixelNest." },
    ],
  }),
  component: Messages,
});

function Messages() {
  const store = useStore();
  const [active, setActive] = useState<string | null>(null);
  const [text, setText] = useState("");
  const end = useRef<HTMLDivElement>(null);
  const ids = [...new Set([...Object.keys(store.threads), ...CREATORS.slice(0, 8).map((c) => c.id)])];
  const thread = active ? store.threads[active] ?? [] : [];
  useEffect(() => end.current?.scrollIntoView({ behavior: "smooth" }), [thread.length]);

  return (
    <div className="mx-auto grid h-[calc(100vh-9rem)] max-w-5xl overflow-hidden pt-6 md:grid-cols-[300px_1fr] md:gap-6">
      <aside className={cn("overflow-y-auto", active && "hidden md:block")}>
        <h1 className="mb-4 text-3xl font-semibold">Messages</h1>
        {ids.map((id) => {
          const c = getCreator(id);
          const last = store.threads[id]?.at(-1);
          return (
            <button key={id} onClick={() => setActive(id)} className={cn("flex w-full items-center gap-3 rounded-2xl p-2.5 text-left", active === id ? "bg-secondary" : "hover:bg-secondary/60")}>
              <img src={c.avatar} alt="" className="h-11 w-11 rounded-full" />
              <div className="min-w-0 flex-1"><p className="text-sm font-medium">{c.name}</p><p className="truncate text-xs text-muted-foreground">{last ? last.text : "Say hello"}</p></div>
              {last && <span className="text-meta">{timeAgo(last.at)}</span>}
            </button>
          );
        })}
      </aside>
      <section className={cn("flex flex-col rounded-3xl bg-surface", !active && "hidden md:flex")}>
        {active ? (
          <>
            <div className="flex items-center gap-3 border-b p-4">
              <button className="md:hidden" onClick={() => setActive(null)} aria-label="Back"><ArrowLeft className="h-5 w-5" /></button>
              <img src={getCreator(active).avatar} alt="" className="h-9 w-9 rounded-full" />
              <p className="font-medium">{getCreator(active).name}</p>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto p-4">
              {thread.map((m, i) => (
                <div key={i} className={cn("max-w-[75%] rounded-2xl px-4 py-2 text-sm", m.from === "me" ? "ml-auto bg-primary text-primary-foreground" : "bg-card")}>{m.text}</div>
              ))}
              <div ref={end} />
            </div>
            <form onSubmit={(e) => { e.preventDefault(); if (text.trim()) { store.sendMessage(active, text.trim()); setText(""); } }} className="flex gap-2 border-t p-3">
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Message" maxLength={500} className="field rounded-full" />
              <button className="btn btn-primary">Send</button>
            </form>
          </>
        ) : (
          <div className="m-auto text-muted-foreground">Pick a conversation</div>
        )}
      </section>
    </div>
  );
}
