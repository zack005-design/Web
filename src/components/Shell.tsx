import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";
import { Bell, Compass, Home, MessageCircle, Moon, Plus, Search, Sun, User } from "lucide-react";
import { Logo } from "./Logo";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/create", label: "Create", icon: Plus },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/messages", label: "Messages", icon: MessageCircle },
] as const;

function Navbar() {
  const store = useStore();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [q, setQ] = useState("");
  const unread = store.notifs.filter((n) => !n.read).length;

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header className={cn("sticky top-0 z-40 transition-all duration-300", scrolled ? "bg-background/80 backdrop-blur-xl shadow-soft" : "bg-background")}>
      <div className="mx-auto flex h-16 max-w-[1800px] items-center gap-3 px-4 md:gap-5 md:px-6">
        <Link to="/" aria-label="PixelNest home"><Logo className="hidden sm:inline-flex" /><Logo compact className="sm:hidden" /></Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.slice(0, 2).map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: true }} className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground" activeProps={{ className: "!text-foreground bg-secondary" }}>
              {n.label}
            </Link>
          ))}
        </nav>
        <form
          className="relative flex-1"
          onSubmit={(e) => { e.preventDefault(); if (q.trim()) { store.addRecent(q.trim()); navigate({ to: "/search", search: { q: q.trim() } }); } }}
        >
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search ideas, colors, moods…" className="h-10 w-full rounded-full bg-secondary pl-10 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-ring/40" />
        </form>
        <div className="hidden items-center gap-1 md:flex">
          <Link to="/create" className="btn btn-primary hidden lg:inline-flex"><Plus className="h-4 w-4" /> Create</Link>
          {NAV.slice(3).map((n) => (
            <Link key={n.to} to={n.to} aria-label={n.label} className="relative grid h-10 w-10 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground" activeProps={{ className: "!text-foreground" }}>
              <n.icon className="h-5 w-5" />
              {n.to === "/notifications" && unread > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />}
            </Link>
          ))}
        </div>
        <button aria-label="Toggle theme" onClick={() => store.setTheme(store.theme === "dark" ? "light" : "dark")} className="grid h-10 w-10 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground">
          {store.theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <Link to="/profile" aria-label="Profile" className="hidden h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground md:grid">
          {store.profile.name[0]}
        </Link>
      </div>
    </header>
  );
}

function MobileNav() {
  const items = [NAV[0], NAV[1], NAV[2], NAV[3], { to: "/profile", label: "Profile", icon: User }] as const;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
      <div className="grid grid-cols-5">
        {items.map((n) => (
          <Link key={n.to} to={n.to} activeOptions={{ exact: true }} className="flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium text-muted-foreground" activeProps={{ className: "!text-primary" }}>
            {n.to === "/create" ? <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground"><n.icon className="h-4 w-4" /></span> : <n.icon className="h-5 w-5" />}
            {n.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

function Cursor() {
  const reduce = useReducedMotion();
  const [on, setOn] = useState(false);
  const [mode, setMode] = useState<"default" | "hover" | "image">("default");
  const [down, setDown] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 600, damping: 40 });
  const sy = useSpring(y, { stiffness: 600, damping: 40 });

  useEffect(() => {
    if (reduce || !window.matchMedia("(pointer: fine)").matches) return;
    setOn(true);
    document.body.classList.add("has-cursor");
    const move = (e: PointerEvent) => {
      x.set(e.clientX); y.set(e.clientY);
      const t = e.target as HTMLElement;
      setMode(t.closest("[data-cursor=image]") ? "image" : t.closest("a,button,input,textarea,select,label") ? "hover" : "default");
    };
    const d = () => setDown(true), u = () => setDown(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerdown", d);
    window.addEventListener("pointerup", u);
    return () => {
      document.body.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", d);
      window.removeEventListener("pointerup", u);
    };
  }, [reduce, x, y]);

  if (!on) return null;
  const size = mode === "image" ? 56 : mode === "hover" ? 34 : 14;
  return (
    <motion.div style={{ x: sx, y: sy }} className="pointer-events-none fixed left-0 top-0 z-[100]">
      <motion.div
        animate={{ width: size, height: size, scale: down ? 0.8 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 26 }}
        className={cn("-translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary", mode === "default" ? "bg-primary" : "bg-primary/10 backdrop-blur-[1px]")}
      />
    </motion.div>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-[70vh] max-w-[1800px] px-3 pb-24 sm:px-4 md:px-6 md:pb-16">{children}</main>
      <footer className="mx-auto hidden max-w-[1800px] items-center justify-between border-t px-6 py-8 md:flex">
        <Logo />
        <p className="text-meta">Discover. Create. Inspire. — © {new Date().getFullYear()} PixelNest</p>
      </footer>
      <MobileNav />
      <Cursor />
    </>
  );
}
