export type Pin = {
  id: string;
  title: string;
  description: string;
  image: string;
  w: number;
  h: number;
  category: string;
  color: string;
  mood: string;
  creatorId: string;
  tags: string[];
  likes: number;
  createdByUser?: boolean;
};

export type Creator = {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  followers: number;
};

export const CATEGORIES = [
  "Architecture", "Interior Design", "Travel", "Nature", "Fashion", "Food",
  "Photography", "Technology", "Art", "Graphic Design", "UI/UX", "Illustration",
];

export const COLORS: { name: string; swatch: string }[] = [
  { name: "Coral", swatch: "oklch(0.7 0.16 32)" },
  { name: "Sand", swatch: "oklch(0.84 0.05 80)" },
  { name: "Forest", swatch: "oklch(0.5 0.1 150)" },
  { name: "Ocean", swatch: "oklch(0.55 0.12 240)" },
  { name: "Ink", swatch: "oklch(0.25 0.02 260)" },
  { name: "Blush", swatch: "oklch(0.86 0.06 10)" },
  { name: "Gold", swatch: "oklch(0.78 0.13 85)" },
  { name: "Mono", swatch: "oklch(0.7 0 0)" },
];

export const MOODS = ["Calm", "Bold", "Dreamy", "Minimal", "Warm", "Moody", "Playful", "Serene"];

const TITLES: Record<string, string[]> = {
  Architecture: ["Concrete light study", "Curved facade at dusk", "Brutalist stairwell", "Glass pavilion"],
  "Interior Design": ["Soft linen living room", "Terracotta kitchen", "Quiet reading nook", "Oak and plaster"],
  Travel: ["Morning in Lisbon", "Coastal road trip", "Hidden alley café", "Desert crossing"],
  Nature: ["Fog over pines", "Wildflower meadow", "Still lake reflections", "Mountain ridge"],
  Fashion: ["Tailored neutrals", "Monochrome layering", "Summer linen edit", "Street style notes"],
  Food: ["Citrus tart", "Slow Sunday brunch", "Hand-rolled pasta", "Matcha ritual"],
  Photography: ["Golden hour portrait", "Film grain streets", "Shadow play", "Long exposure"],
  Technology: ["Desk setup, refined", "Analog meets digital", "Studio workstation", "Minimal hardware"],
  Art: ["Abstract color fields", "Ceramic forms", "Gallery wall ideas", "Ink on paper"],
  "Graphic Design": ["Swiss poster grid", "Bold type specimen", "Packaging system", "Editorial spread"],
  "UI/UX": ["Dashboard calm", "Onboarding flow", "Mobile card patterns", "Motion study"],
  Illustration: ["Botanical line art", "Tiny city scenes", "Character sketches", "Risograph prints"],
};

const NAMES = [
  "Mira Okafor", "Leo Brandt", "Aiko Tanaka", "Sofia Ruiz", "Noah Lindqvist", "Priya Nair",
  "Elias Moreau", "Hana Kim", "Theo Walsh", "Ines Costa", "Ravi Mehta", "Clara Holm",
  "Jonah Reyes", "Yuki Sato", "Amara Diallo", "Felix Wagner",
];

const RATIOS: [number, number][] = [
  [600, 900], [600, 750], [600, 600], [600, 1050], [600, 420], [600, 800], [600, 1200], [600, 680],
];

function rand(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

export const CREATORS: Creator[] = NAMES.map((name, i) => ({
  id: `c${i + 1}`,
  name,
  handle: name.split(" ")[0]!.toLowerCase() + "." + name.split(" ")[1]!.toLowerCase().slice(0, 4),
  avatar: `https://i.pravatar.cc/160?img=${(i * 3 + 5) % 70}`,
  bio: ["Visual curator & photographer", "Designer collecting quiet spaces", "Food stylist, slow mornings", "Architect. Light chaser.", "Illustrator and print maker", "Traveling with a 35mm"][i % 6]!,
  followers: Math.round(800 + rand(i + 7) * 48000),
}));

export const PINS: Pin[] = Array.from({ length: 132 }, (_, i) => {
  const category = CATEGORIES[i % CATEGORIES.length]!;
  const [w, h] = RATIOS[Math.floor(rand(i + 1) * RATIOS.length)]!;
  const titles = TITLES[category]!;
  const title = titles[Math.floor(i / CATEGORIES.length) % titles.length]!;
  const color = COLORS[Math.floor(rand(i + 31) * COLORS.length)]!.name;
  const mood = MOODS[Math.floor(rand(i + 57) * MOODS.length)]!;
  return {
    id: `p${i + 1}`,
    title,
    description: `A ${mood.toLowerCase()} ${category.toLowerCase()} reference — saved for its ${color.toLowerCase()} palette and the way the light settles.`,
    image: `https://picsum.photos/seed/pixelnest${i + 1}/${w}/${h}`,
    w, h, category, color, mood,
    creatorId: CREATORS[Math.floor(rand(i + 13) * CREATORS.length)]!.id,
    tags: [category.toLowerCase(), mood.toLowerCase(), color.toLowerCase()],
    likes: Math.round(20 + rand(i + 3) * 4800),
  };
});

export const getCreator = (id: string) => CREATORS.find((c) => c.id === id) ?? CREATORS[0]!;
export const formatCount = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : `${n}`);
