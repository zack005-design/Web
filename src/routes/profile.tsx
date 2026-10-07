import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Masonry } from "@/components/PinCard";
import { CATEGORIES } from "@/lib/data";
import { useStore, type Accent } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your profile — PixelNest" },
      { name: "description", content: "Your PixelNest boards, created and liked ideas, and preferences." },
      { property: "og:title", content: "Your profile — PixelNest" },
      { property: "og:description", content: "Your PixelNest boards, created and liked ideas, and preferences." },
    ],
  }),
  component: Profile,
});

const ACCENTS: { id: Accent; cls: string }[] = [
  { id: "coral", cls: "" }, { id: "purple", cls: "" }, { id: "blue", cls: "" }, { id: "emerald", cls: "" },
];

function Profile() {
  const store = useStore();
  const [tab, setTab] = useState<"boards" | "created" | "liked" | "settings">("boards");
  const [openBoard, setOpenBoard] = useState<string | null>(null);
  const [newBoard, setNewBoard] = useState("");
  const board = store.boards.find((b) => b.id === openBoard);

  return (
    <div className="pt-10">
      <div className="flex flex-col items-center text-center">
        <div className="grid h-24 w-24 place-items-center rounded-full bg-primary font-display text-4xl font-semibold text-primary-foreground">{store.profile.name[0]}</div>
        <h1 className="mt-4 text-3xl font-semibold">{store.profile.name}</h1>
        <p className="text-meta">@{store.profile.handle}</p>
        <p className="mt-2 text-muted-foreground">{store.profile.bio}</p>
        <p className="mt-2 text-sm">{store.following.length} following · {store.boards.length} boards</p>
      </div>
      <div className="mt-8 flex justify-center gap-2">
        {(["boards", "created", "liked", "settings"] as const).map((t) => (
          <button key={t} onClick={() => { setTab(t); setOpenBoard(null); }} className={cn("chip capitalize", tab === t && "chip-active")}>{t}</button>
        ))}
      </div>
      <div className="mt-8">
        {tab === "boards" && !board && (
          <>
            <form onSubmit={(e) => { e.preventDefault(); if (newBoard.trim()) { store.createBoard(newBoard.trim()); setNewBoard(""); } }} className="mx-auto mb-8 flex max-w-sm gap-2">
              <input value={newBoard} onChange={(e) => setNewBoard(e.target.value)} placeholder="New board name" className="field rounded-full" maxLength={40} />
              <button className="btn btn-primary">Add</button>
            </form>
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
              {store.boards.map((b) => {
                const imgs = b.pinIds.slice(0, 3).map((id) => store.getPin(id)?.image).filter(Boolean) as string[];
                return (
                  <button key={b.id} onClick={() => setOpenBoard(b.id)} className="group text-left" data-cursor="image">
                    <div className="grid aspect-[4/3] grid-cols-3 grid-rows-2 gap-0.5 overflow-hidden rounded-2xl bg-muted">
                      {imgs[0] && <img src={imgs[0]} alt="" className="col-span-2 row-span-2 h-full w-full object-cover" />}
                      {imgs[1] && <img src={imgs[1]} alt="" className="h-full w-full object-cover" />}
                      {imgs[2] && <img src={imgs[2]} alt="" className="h-full w-full object-cover" />}
                    </div>
                    <p className="mt-2 font-medium">{b.name}</p>
                    <p className="text-meta">{b.pinIds.length} ideas</p>
                  </button>
                );
              })}
            </div>
          </>
        )}
        {tab === "boards" && board && (
          <>
            <div className="mb-6 flex items-center gap-3">
              <button onClick={() => setOpenBoard(null)} className="text-sm text-muted-foreground">← Boards</button>
              <h2 className="text-2xl font-semibold">{board.name}</h2>
              <button onClick={() => { store.deleteBoard(board.id); setOpenBoard(null); }} className="ml-auto text-muted-foreground hover:text-destructive" aria-label="Delete board"><Trash2 className="h-4 w-4" /></button>
            </div>
            <Masonry pins={board.pinIds.map((id) => store.getPin(id)).filter((p) => !!p)} />
          </>
        )}
        {tab === "created" && (store.created.length ? <Masonry pins={store.created} /> : <p className="py-16 text-center text-muted-foreground">You haven't created anything yet. <Link to="/create" className="text-primary">Create a pin</Link></p>)}
        {tab === "liked" && <Masonry pins={store.liked.map((id) => store.getPin(id)).filter((p) => !!p)} />}
        {tab === "settings" && <Settings />}
      </div>
    </div>
  );
}

function Settings() {
  const store = useStore();
  const [p, setP] = useState(store.profile);
  return (
    <div className="mx-auto max-w-lg space-y-8">
      <section className="space-y-3">
        <h3 className="font-semibold">Profile</h3>
        <input className="field" value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} maxLength={40} />
        <input className="field" value={p.handle} onChange={(e) => setP({ ...p, handle: e.target.value })} maxLength={30} />
        <textarea className="field" value={p.bio} onChange={(e) => setP({ ...p, bio: e.target.value })} maxLength={160} />
        <button onClick={() => p.name.trim() && store.setProfile(p)} className="btn btn-primary">Save profile</button>
      </section>
      <section>
        <h3 className="mb-3 font-semibold">Accent color</h3>
        <div className="flex gap-3">
          {ACCENTS.map((a) => (
            <button key={a.id} data-accent={a.id} onClick={() => store.setAccent(a.id)} aria-label={a.id} className={cn("h-10 w-10 rounded-full bg-primary ring-offset-2 ring-offset-background", store.accent === a.id && "ring-2 ring-foreground")} />
          ))}
        </div>
      </section>
      <section>
        <h3 className="mb-3 font-semibold">Theme</h3>
        <div className="flex gap-2">{(["light", "dark"] as const).map((t) => <button key={t} onClick={() => store.setTheme(t)} className={cn("chip capitalize", store.theme === t && "chip-active")}>{t}</button>)}</div>
      </section>
      <section>
        <h3 className="mb-1 font-semibold">Interests</h3>
        <p className="text-meta mb-3">We'll show these first in your home feed.</p>
        <div className="flex flex-wrap gap-2">{CATEGORIES.map((c) => <button key={c} onClick={() => store.toggleInterest(c)} className={cn("chip", store.interests.includes(c) && "chip-active")}>{c}</button>)}</div>
      </section>
    </div>
  );
}
