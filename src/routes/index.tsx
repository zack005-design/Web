import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight, Plus } from "lucide-react";
import { Masonry } from "@/components/PinCard";
import { CATEGORIES, PINS } from "@/lib/data";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PixelNest — Find ideas worth saving" },
      { name: "description", content: "Discover visual inspiration, collect what sparks your imagination, and create something of your own." },
      { property: "og:title", content: "PixelNest — Find ideas worth saving" },
      { property: "og:description", content: "Discover visual inspiration, collect what sparks your imagination, and create something of your own." },
    ],
  }),
  component: Home,
});

const FLOAT = [
  { i: 3, cls: "left-[2%] top-[8%] w-28 rotate-[-6deg]" },
  { i: 8, cls: "left-[12%] bottom-[2%] w-24 rotate-[4deg]" },
  { i: 17, cls: "left-[24%] top-[-4%] w-20 rotate-[3deg]" },
  { i: 22, cls: "right-[24%] top-[-2%] w-20 rotate-[-4deg]" },
  { i: 31, cls: "right-[12%] bottom-[0%] w-24 rotate-[-3deg]" },
  { i: 44, cls: "right-[2%] top-[10%] w-28 rotate-[6deg]" },
];

function Home() {
  const store = useStore();
  const [cat, setCat] = useState("For you");
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 400], [0, -60]);
  const y2 = useTransform(scrollY, [0, 400], [0, -30]);

  const pins = useMemo(() => {
    if (cat === "For you") {
      const list = store.allPins;
      if (!store.interests.length) return list;
      return [...list.filter((p) => store.interests.includes(p.category)), ...list.filter((p) => !store.interests.includes(p.category))];
    }
    return store.allPins.filter((p) => p.category === cat);
  }, [cat, store.allPins, store.interests]);

  return (
    <>
      <section className="relative mx-auto flex min-h-[360px] max-w-6xl flex-col items-center justify-center py-14 text-center md:min-h-[420px]">
        {FLOAT.map((f, k) => (
          <motion.img
            key={f.i}
            src={PINS[f.i].image}
            alt=""
            style={{ y: k % 2 ? y1 : y2 }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 + k * 0.07, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className={cn("absolute hidden aspect-[3/4] rounded-xl object-cover shadow-lift md:block", f.cls)}
          />
        ))}
        <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-meta mb-4 uppercase tracking-[0.2em]">Discover. Create. Inspire.</motion.p>
        <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="text-display max-w-xl">
          Find ideas <span className="text-primary">worth saving.</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-4 max-w-md text-muted-foreground">
          Discover visual inspiration, collect what sparks your imagination, and create something of your own.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-7 flex gap-2.5">
          <Link to="/explore" className="btn btn-primary h-11 px-6">Explore <ArrowRight className="h-4 w-4" /></Link>
          <Link to="/create" className="btn btn-ghost h-11 px-6"><Plus className="h-4 w-4" /> Create</Link>
        </motion.div>
      </section>

      <div className="sticky top-16 z-30 -mx-3 mb-5 bg-background/85 px-3 py-3 backdrop-blur-xl sm:-mx-4 sm:px-4 md:-mx-6 md:px-6">
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {["For you", ...CATEGORIES].map((c) => (
            <button key={c} onClick={() => setCat(c)} className={cn("chip", cat === c && "chip-active")}>{c}</button>
          ))}
        </div>
      </div>
      <Masonry pins={pins} />
    </>
  );
}
