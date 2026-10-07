import { Link } from "@tanstack/react-router";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { Heart, Bookmark, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { getCreator, type Pin } from "@/lib/data";
import { cn } from "@/lib/utils";

export function sharePin(id: string) {
  const url = `${window.location.origin}/pin/${id}`;
  navigator.clipboard?.writeText(url).then(() => toast("Link copied", { description: url }));
}

export function PinCard({ pin, index = 0 }: { pin: Pin; index?: number }) {
  const store = useStore();
  const liked = store.liked.includes(pin.id);
  const saved = store.isSaved(pin.id);
  const creator: { name: string; avatar: string } = pin.creatorId === "me" ? { name: store.profile.name, avatar: "" } : getCreator(pin.creatorId);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [2, -2]), { stiffness: 260, damping: 22 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-2, 2]), { stiffness: 260, damping: 22 });

  const quickSave = (e: React.MouseEvent) => {
    e.preventDefault();
    if (saved) {
      store.unsave(pin.id);
      toast("Removed from your boards");
    } else {
      const b = store.boards[0] ?? { id: store.createBoard("Saved ideas"), name: "Saved ideas" };
      store.saveTo(pin.id, b.id);
      toast(`Saved to ${b.name}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "80px" }}
      transition={{ duration: 0.5, delay: (index % 6) * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className="mb-4 break-inside-avoid"
    >
      <motion.div
        style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          mx.set((e.clientX - r.left) / r.width - 0.5);
          my.set((e.clientY - r.top) / r.height - 0.5);
        }}
        onMouseLeave={() => { mx.set(0); my.set(0); }}
        className="group relative"
      >
        <Link to="/pin/$id" params={{ id: pin.id }} data-cursor="image" className="block overflow-hidden rounded-2xl bg-muted">
          <img
            src={pin.image}
            alt={pin.title}
            loading="lazy"
            style={{ aspectRatio: `${pin.w}/${pin.h}` }}
            className="w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-overlay opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </Link>
        <div className="absolute right-2.5 top-2.5 flex gap-1.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <button onClick={quickSave} className={cn("btn h-9 px-3.5 text-xs", saved ? "bg-foreground text-background" : "btn-primary")}>
            <Bookmark className="h-3.5 w-3.5" fill={saved ? "currentColor" : "none"} /> {saved ? "Saved" : "Save"}
          </button>
        </div>
        <div className="absolute inset-x-2.5 bottom-2.5 flex items-center justify-between opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="truncate text-xs font-medium text-on-image">{pin.title}</span>
          <div className="flex gap-1.5">
            <button aria-label="Like" onClick={(e) => { e.preventDefault(); store.toggleLike(pin.id); }} className="grid h-8 w-8 place-items-center rounded-full bg-card text-foreground">
              <Heart className={cn("h-4 w-4", liked && "text-primary")} fill={liked ? "currentColor" : "none"} />
            </button>
            <button aria-label="Share" onClick={(e) => { e.preventDefault(); sharePin(pin.id); }} className="grid h-8 w-8 place-items-center rounded-full bg-card text-foreground">
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
      <div className="mt-2 flex items-center gap-2 px-1">
        {creator.avatar ? <img src={creator.avatar} alt="" className="h-5 w-5 rounded-full object-cover" /> : <span className="h-5 w-5 rounded-full bg-primary" />}
        <span className="truncate text-xs text-muted-foreground">{creator.name}</span>
      </div>
    </motion.div>
  );
}

export function Masonry({ pins }: { pins: Pin[] }) {
  if (!pins.length) return <p className="py-24 text-center text-muted-foreground">Nothing here yet.</p>;
  return (
    <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6">
      {pins.map((p, i) => <PinCard key={p.id} pin={p} index={i} />)}
    </div>
  );
}
