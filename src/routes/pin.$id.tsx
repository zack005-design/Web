import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Bookmark, Heart, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Masonry, sharePin } from "@/components/PinCard";
import { formatCount, getCreator } from "@/lib/data";
import { timeAgo, useStore, type Comment } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pin/$id")({
  head: () => ({
    meta: [
      { title: "Idea — PixelNest" },
      { name: "description", content: "View this idea on PixelNest, save it to a board and discover related ideas." },
      { property: "og:title", content: "Idea — PixelNest" },
      { property: "og:description", content: "View this idea on PixelNest and discover related ideas." },
    ],
  }),
  component: PinPage,
});

function PinPage() {
  const { id } = Route.useParams();
  const store = useStore();
  const pin = store.getPin(id);
  const [boardOpen, setBoardOpen] = useState(false);
  const [newBoard, setNewBoard] = useState("");
  const [text, setText] = useState("");

  if (!pin) return <div className="py-32 text-center"><p className="text-muted-foreground">This idea isn't available.</p><Link to="/" className="mt-4 inline-block text-primary">Back home</Link></div>;

  const mine = pin.creatorId === "me";
  const creator = mine ? null : getCreator(pin.creatorId);
  const liked = store.liked.includes(pin.id);
  const savedBoard = store.boards.find((b) => b.pinIds.includes(pin.id));
  const related = store.allPins.filter((p) => p.id !== pin.id && (p.category === pin.category || p.mood === pin.mood)).slice(0, 30);
  const comments = store.comments[pin.id] ?? [];

  return (
    <div className="pt-4">
      <button onClick={() => history.back()} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back</button>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
        <motion.img layoutId={`img-${pin.id}`} src={pin.image} alt={pin.title} style={{ aspectRatio: `${pin.w}/${pin.h}` }} className="max-h-[80vh] w-full rounded-3xl object-cover" />
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <button onClick={() => store.toggleLike(pin.id)} aria-label="Like" className={cn("btn btn-ghost w-10 px-0", liked && "text-primary")}><Heart className="h-4 w-4" fill={liked ? "currentColor" : "none"} /></button>
            <button onClick={() => sharePin(pin.id)} aria-label="Share" className="btn btn-ghost w-10 px-0"><Share2 className="h-4 w-4" /></button>
            <span className="text-meta">{formatCount(pin.likes + (liked ? 1 : 0))} likes</span>
            <div className="relative ml-auto">
              <button onClick={() => (savedBoard ? (store.unsave(pin.id), toast("Removed")) : setBoardOpen((o) => !o))} className={cn("btn", savedBoard ? "bg-foreground text-background" : "btn-primary")}>
                <Bookmark className="h-4 w-4" fill={savedBoard ? "currentColor" : "none"} /> {savedBoard ? `Saved · ${savedBoard.name}` : "Save"}
              </button>
              {boardOpen && !savedBoard && (
                <div className="absolute right-0 top-12 z-20 w-64 rounded-2xl bg-popover p-2 shadow-lift">
                  {store.boards.map((b) => (
                    <button key={b.id} onClick={() => { store.saveTo(pin.id, b.id); setBoardOpen(false); toast(`Saved to ${b.name}`); }} className="block w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-secondary">{b.name}</button>
                  ))}
                  <form onSubmit={(e) => { e.preventDefault(); if (!newBoard.trim()) return; const bid = store.createBoard(newBoard.trim()); store.saveTo(pin.id, bid); setBoardOpen(false); toast(`Saved to ${newBoard}`); setNewBoard(""); }} className="mt-1 border-t pt-2">
                    <input value={newBoard} onChange={(e) => setNewBoard(e.target.value)} placeholder="+ New board" className="field py-2 text-sm" />
                  </form>
                </div>
              )}
            </div>
          </div>
          <Link to="/explore" search={{ category: pin.category }} className="text-meta mt-6 uppercase tracking-widest">{pin.category} · {pin.mood} · {pin.color}</Link>
          <h1 className="mt-2 text-3xl font-semibold md:text-4xl">{pin.title}</h1>
          <p className="mt-3 text-muted-foreground">{pin.description}</p>

          <div className="mt-6 flex items-center gap-3">
            {creator ? (
              <>
                <Link to="/creator/$id" params={{ id: creator.id }}><img src={creator.avatar} alt="" className="h-11 w-11 rounded-full" /></Link>
                <div className="flex-1"><Link to="/creator/$id" params={{ id: creator.id }} className="font-medium">{creator.name}</Link><p className="text-meta">{formatCount(creator.followers + (store.following.includes(creator.id) ? 1 : 0))} followers</p></div>
                <button onClick={() => store.toggleFollow(creator.id)} className={cn("btn", store.following.includes(creator.id) ? "btn-ghost" : "bg-foreground text-background")}>{store.following.includes(creator.id) ? "Following" : "Follow"}</button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Created by you · <button onClick={() => { store.deletePin(pin.id); history.back(); }} className="text-destructive">Delete</button></p>
            )}
          </div>

          <div className="mt-8 border-t pt-6">
            <h2 className="text-lg font-semibold">Comments <span className="text-muted-foreground">{comments.length}</span></h2>
            <div className="mt-3 space-y-4">{comments.map((c) => <CommentItem key={c.id} c={c} pinId={pin.id} />)}</div>
            <form onSubmit={(e) => { e.preventDefault(); if (text.trim()) { store.addComment(pin.id, text.trim()); setText(""); } }} className="mt-4 flex gap-2">
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a comment" maxLength={400} className="field rounded-full" />
              <button className="btn btn-primary">Post</button>
            </form>
          </div>
        </div>
      </motion.div>
      <h2 className="mb-5 mt-16 text-2xl font-semibold">More like this</h2>
      <Masonry pins={related} />
    </div>
  );
}

function CommentItem({ c, pinId }: { c: Comment; pinId: string }) {
  const store = useStore();
  const [reply, setReply] = useState("");
  const [open, setOpen] = useState(false);
  return (
    <div>
      <p className="text-sm"><span className="font-semibold">{c.author}</span> {c.text}</p>
      <div className="text-meta mt-1 flex gap-3">{timeAgo(c.at)}<button onClick={() => setOpen(!open)} className="font-medium">Reply</button></div>
      <div className="ml-5 mt-2 space-y-2 border-l pl-3">
        {c.replies.map((r) => <p key={r.id} className="text-sm"><span className="font-semibold">{r.author}</span> {r.text}</p>)}
      </div>
      {open && (
        <form onSubmit={(e) => { e.preventDefault(); if (reply.trim()) { store.addComment(pinId, reply.trim(), c.id); setReply(""); setOpen(false); } }} className="ml-5 mt-2">
          <input autoFocus value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write a reply" className="field py-2 text-sm" />
        </form>
      )}
    </div>
  );
}
