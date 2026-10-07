import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { CATEGORIES, COLORS, MOODS } from "@/lib/data";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/create")({
  head: () => ({
    meta: [
      { title: "Create a Pin — PixelNest" },
      { name: "description", content: "Share your own visual idea on PixelNest." },
      { property: "og:title", content: "Create a Pin — PixelNest" },
      { property: "og:description", content: "Share your own visual idea on PixelNest." },
    ],
  }),
  component: Create,
});

function Create() {
  const store = useStore();
  const navigate = useNavigate();
  const [image, setImage] = useState("");
  const [dims, setDims] = useState({ w: 600, h: 800 });
  const [f, setF] = useState({ title: "", description: "", category: CATEGORIES[0]!, color: COLORS[0]!.name, mood: MOODS[0]!, board: "" });

  const onFile = (file?: File) => {
    if (!file) return;
    if (file.size > 3e6) { toast.error("Please choose an image under 3 MB"); return; }
    const r = new FileReader();
    r.onload = () => setImage(String(r.result));
    r.readAsDataURL(file);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) { toast.error("Add an image first"); return; }
    if (!f.title.trim()) { toast.error("Give your pin a title"); return; }
    const id = store.addPin({ title: f.title.trim(), description: f.description.trim(), image, ...dims, category: f.category, color: f.color, mood: f.mood, tags: [f.category.toLowerCase(), f.mood.toLowerCase()] });
    if (f.board) store.saveTo(id, f.board);
    toast.success("Pin published");
    navigate({ to: "/pin/$id", params: { id } });
  };

  return (
    <form onSubmit={submit} className="mx-auto grid max-w-5xl gap-8 pt-8 md:grid-cols-[1fr_1.1fr]">
      <label className="relative flex min-h-[420px] cursor-pointer items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed bg-surface">
        {image ? (
          <img src={image} alt="Preview" onLoad={(e) => setDims({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })} className="h-full w-full object-cover" />
        ) : (
          <div className="text-center text-muted-foreground"><ImagePlus className="mx-auto mb-3 h-8 w-8" /><p className="font-medium text-foreground">Upload an image</p><p className="text-sm">JPG or PNG, under 3 MB</p></div>
        )}
        <input type="file" accept="image/*" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
      </label>
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold">Create a Pin</h1>
        <input className="field" placeholder="…or paste an image URL" onBlur={(e) => e.target.value && setImage(e.target.value)} />
        <input className="field" placeholder="Title" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} maxLength={80} />
        <textarea className="field min-h-28" placeholder="Tell everyone what makes this worth saving" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} maxLength={500} />
        <div className="grid grid-cols-3 gap-3">
          <select className="field" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
          <select className="field" value={f.color} onChange={(e) => setF({ ...f, color: e.target.value })}>{COLORS.map((c) => <option key={c.name}>{c.name}</option>)}</select>
          <select className="field" value={f.mood} onChange={(e) => setF({ ...f, mood: e.target.value })}>{MOODS.map((m) => <option key={m}>{m}</option>)}</select>
        </div>
        <select className="field" value={f.board} onChange={(e) => setF({ ...f, board: e.target.value })}>
          <option value="">Don't add to a board</option>
          {store.boards.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <button className="btn btn-primary h-12 w-full">Publish</button>
      </div>
    </form>
  );
}
