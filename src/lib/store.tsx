import React, { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { PINS, CREATORS, type Pin } from "./data";

export type Accent = "coral" | "purple" | "blue" | "emerald";
export type Board = { id: string; name: string; pinIds: string[]; followed?: boolean };
export type Comment = { id: string; author: string; avatar?: string; text: string; at: number; replies: Comment[] };
export type Msg = { from: "me" | "them"; text: string; at: number };
export type Notif = { id: string; text: string; at: number; pinId?: string; creatorId?: string; read: boolean };

type State = {
  liked: string[];
  boards: Board[];
  following: string[];
  created: Pin[];
  comments: Record<string, Comment[]>;
  threads: Record<string, Msg[]>;
  notifs: Notif[];
  theme: "light" | "dark";
  accent: Accent;
  profile: { name: string; handle: string; bio: string };
  recent: string[];
  interests: string[];
};

const now = Date.now();
const initial: State = {
  liked: [],
  boards: [
    { id: "b1", name: "Home ideas", pinIds: ["p2", "p14", "p26"] },
    { id: "b2", name: "Travel someday", pinIds: ["p3", "p15"] },
    { id: "b3", name: "Design references", pinIds: ["p10", "p11", "p22"] },
  ],
  following: [],
  created: [],
  comments: {},
  threads: {
    c1: [{ from: "them", text: "Loved your board on quiet interiors — where did you find the oak shelf?", at: now - 3600e3 }],
    c3: [{ from: "them", text: "Thanks for the follow! New series dropping Friday.", at: now - 86400e3 }],
  },
  notifs: [
    { id: "n1", text: "Mira Okafor started following you", at: now - 1800e3, creatorId: "c1", read: false },
    { id: "n2", text: "Your pin “Concrete light study” is trending in Architecture", at: now - 7200e3, pinId: "p1", read: false },
    { id: "n3", text: "Aiko Tanaka saved an idea you might like", at: now - 86400e3, pinId: "p3", read: true },
    { id: "n4", text: "New ideas in Interior Design picked for you", at: now - 2 * 86400e3, pinId: "p2", read: true },
  ],
  theme: "light",
  accent: "coral",
  profile: { name: "Alex Rivera", handle: "alex.rivera", bio: "Collecting things worth keeping." },
  recent: [],
  interests: [],
};

const KEY = "pixelnest-state-v1";

function useStoreValue() {
  const [s, setS] = useState<State>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setS({ ...initial, ...JSON.parse(raw) });
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(KEY, JSON.stringify(s));
    const root = document.documentElement;
    root.classList.toggle("dark", s.theme === "dark");
    root.dataset["accent"] = s.accent;
  }, [s, ready]);

  const set = (fn: (s: State) => Partial<State>) => setS((p) => ({ ...p, ...fn(p) }));
  const notify = (text: string, extra: Partial<Notif> = {}) =>
    set((p) => ({ notifs: [{ id: crypto.randomUUID(), text, at: Date.now(), read: false, ...extra }, ...p.notifs] }));

  const allPins = useMemo(() => [...s.created, ...PINS], [s.created]);

  return {
    ...s,
    ready,
    allPins,
    getPin: (id: string) => allPins.find((p) => p.id === id),
    isSaved: (id: string) => s.boards.some((b) => b.pinIds.includes(id)),
    toggleLike: (id: string) => set((p) => ({ liked: p.liked.includes(id) ? p.liked.filter((x) => x !== id) : [...p.liked, id] })),
    saveTo: (pinId: string, boardId: string) =>
      set((p) => ({ boards: p.boards.map((b) => (b.id === boardId && !b.pinIds.includes(pinId) ? { ...b, pinIds: [pinId, ...b.pinIds] } : b)) })),
    unsave: (pinId: string) => set((p) => ({ boards: p.boards.map((b) => ({ ...b, pinIds: b.pinIds.filter((x) => x !== pinId) })) })),
    createBoard: (name: string) => {
      const id = "b" + Date.now();
      set((p) => ({ boards: [...p.boards, { id, name, pinIds: [] }] }));
      return id;
    },
    deleteBoard: (id: string) => set((p) => ({ boards: p.boards.filter((b) => b.id !== id) })),
    toggleFollow: (cid: string) => {
      const was = s.following.includes(cid);
      set((p) => ({ following: was ? p.following.filter((x) => x !== cid) : [...p.following, cid] }));
      if (!was) {
        const c = CREATORS.find((x) => x.id === cid);
        setTimeout(() => notify(`${c?.name} followed you back`, { creatorId: cid }), 2500);
      }
    },
    addPin: (pin: Omit<Pin, "id" | "likes" | "creatorId">) => {
      const id = "u" + Date.now();
      set((p) => ({ created: [{ ...pin, id, likes: 0, creatorId: "me", createdByUser: true }, ...p.created] }));
      notify(`Your pin “${pin.title}” is live`, { pinId: id });
      return id;
    },
    deletePin: (id: string) => set((p) => ({ created: p.created.filter((x) => x.id !== id) })),
    addComment: (pinId: string, text: string, parentId?: string) =>
      set((p) => {
        const c: Comment = { id: crypto.randomUUID(), author: p.profile.name, text, at: Date.now(), replies: [] };
        const list = p.comments[pinId] ?? [];
        const next = parentId ? list.map((x) => (x.id === parentId ? { ...x, replies: [...x.replies, c] } : x)) : [...list, c];
        return { comments: { ...p.comments, [pinId]: next } };
      }),
    sendMessage: (cid: string, text: string) => {
      set((p) => ({ threads: { ...p.threads, [cid]: [...(p.threads[cid] ?? []), { from: "me", text, at: Date.now() }] } }));
      const replies = ["Love that — thanks for sharing!", "Oh nice, I'll check it out.", "Totally agree. Saving this to my board.", "Ha, great find ✨"];
      setTimeout(
        () => set((p) => ({ threads: { ...p.threads, [cid]: [...(p.threads[cid] ?? []), { from: "them", text: replies[Math.floor(Math.random() * replies.length)]!, at: Date.now() }] } })),
        1400,
      );
    },
    markAllRead: () => set((p) => ({ notifs: p.notifs.map((n) => ({ ...n, read: true })) })),
    setTheme: (theme: State["theme"]) => set(() => ({ theme })),
    setAccent: (accent: Accent) => set(() => ({ accent })),
    setProfile: (profile: State["profile"]) => set(() => ({ profile })),
    addRecent: (q: string) => set((p) => ({ recent: [q, ...p.recent.filter((x) => x !== q)].slice(0, 6) })),
    toggleInterest: (c: string) => set((p) => ({ interests: p.interests.includes(c) ? p.interests.filter((x) => x !== c) : [...p.interests, c] })),
  };
}

type Store = ReturnType<typeof useStoreValue>;
// Keep one context instance across hot reloads so the provider and consumers always match.
const g = globalThis as unknown as { __pixelnestCtx?: React.Context<Store | null> };
const Ctx = (g.__pixelnestCtx ??= createContext<Store | null>(null));

export function StoreProvider({ children }: { children: ReactNode }) {
  const v = useStoreValue();
  return <Ctx.Provider value={v}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore outside provider");
  return v;
}

export function timeAgo(t: number) {
  const m = Math.round((Date.now() - t) / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  if (m < 1440) return `${Math.round(m / 60)}h`;
  return `${Math.round(m / 1440)}d`;
}
