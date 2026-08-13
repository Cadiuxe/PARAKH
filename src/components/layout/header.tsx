"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrainCircuit, ArrowRight, User, ShieldAlert, LogOut, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AdaptiveLogicDialog } from "@/components/landing/adaptive-logic-dialog";
import { useAuth } from "@/lib/auth-context";

function getInitials(name: string) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Nav item IDs for the glass slider
const NAV_ITEMS = ["features", "adaptive", "preview", "dashboard"] as const;
type NavId = (typeof NAV_ITEMS)[number];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<NavId | null>(null);

  // Refs for each nav item — used to read their position for the glass slider
  const navRefs = useRef<Partial<Record<NavId, HTMLDivElement | null>>>({});
  const navContainerRef = useRef<HTMLElement>(null);

  // Glass slider position state
  const [glassRect, setGlassRect] = useState<{
    left: number;
    width: number;
    top: number;
    height: number;
  } | null>(null);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const { user, profile, signOut } = useAuth();

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "User";

  // Update glass slider rect when hovered item changes
  const updateGlass = useCallback((id: NavId | null) => {
    if (!id) {
      setGlassRect(null);
      return;
    }
    const el = navRefs.current[id];
    const nav = navContainerRef.current;
    if (!el || !nav) return;
    const elRect = el.getBoundingClientRect();
    const navRect = nav.getBoundingClientRect();
    setGlassRect({
      left: elRect.left - navRect.left,
      top: elRect.top - navRect.top,
      width: elRect.width,
      height: elRect.height,
    });
  }, []);

  const handleNavEnter = useCallback(
    (id: NavId) => {
      setHoveredNav(id);
      updateGlass(id);
    },
    [updateGlass]
  );

  const handleNavLeave = useCallback(() => {
    setHoveredNav(null);
    setGlassRect(null);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close profile menu on click outside
  useEffect(() => {
    if (!profileOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileOpen]);

  // Close profile menu on Escape key
  useEffect(() => {
    if (!profileOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setProfileOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [profileOpen]);

  const handleSectionScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <header className="sticky top-3 z-50 w-full px-4 sm:px-6 flex justify-center pointer-events-none">
      <div
        className={`pointer-events-auto flex items-center justify-between w-full max-w-5xl rounded-full px-4 sm:px-6 py-2.5 transition-all duration-300 ${
          scrolled
            ? "bg-zinc-950/90 border border-zinc-800/90 shadow-2xl shadow-black/60 backdrop-blur-2xl"
            : "bg-zinc-900/60 border border-zinc-800/60 shadow-xl backdrop-blur-xl"
        }`}
      >
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
            <BrainCircuit className="h-4.5 w-4.5" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-tight text-zinc-100">PARAKH</span>
            <span className="text-[9px] text-zinc-400 -mt-1 tracking-wider uppercase">Adaptive CAT</span>
          </div>
        </Link>

        {/* Centered Desktop Navigation Links — single shared glass slider */}
        <nav
          ref={navContainerRef}
          className="hidden md:flex items-center relative text-xs font-medium text-zinc-400"
          onMouseLeave={handleNavLeave}
        >
          {/* Shared glass surface — positioned absolutely within the nav */}
          <AnimatePresence>
            {glassRect && (
              <motion.div
                key="glass"
                className="absolute rounded-md bg-zinc-800/55 border border-zinc-700/40 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  left: glassRect.left,
                  top: glassRect.top,
                  width: glassRect.width,
                  height: glassRect.height,
                }}
                exit={{ opacity: 0 }}
                transition={{
                  opacity: { duration: 0.12 },
                  left: { type: "spring", stiffness: 420, damping: 32, mass: 0.6 },
                  top: { type: "spring", stiffness: 420, damping: 32, mass: 0.6 },
                  width: { type: "spring", stiffness: 420, damping: 32, mass: 0.6 },
                  height: { type: "spring", stiffness: 420, damping: 32, mass: 0.6 },
                }}
              />
            )}
          </AnimatePresence>

          {/* Platform Capabilities */}
          <div
            ref={(el) => { navRefs.current.features = el; }}
            onMouseEnter={() => handleNavEnter("features")}
          >
            <a
              href="#features"
              onClick={(e) => handleSectionScroll(e, "features")}
              className="relative z-10 block px-3 py-1.5 transition-colors hover:text-zinc-100 cursor-pointer"
            >
              Platform Capabilities
            </a>
          </div>

          {/* Adaptive Logic */}
          <div
            ref={(el) => { navRefs.current.adaptive = el; }}
            onMouseEnter={() => handleNavEnter("adaptive")}
          >
            <div className="relative z-10 px-3 py-1.5">
              <AdaptiveLogicDialog
                trigger={
                  <button
                    type="button"
                    className="transition-colors hover:text-zinc-100 cursor-pointer font-medium text-zinc-400"
                  >
                    Adaptive Logic
                  </button>
                }
              />
            </div>
          </div>

          {/* Live Preview */}
          <div
            ref={(el) => { navRefs.current.preview = el; }}
            onMouseEnter={() => handleNavEnter("preview")}
          >
            <a
              href="#preview"
              onClick={(e) => handleSectionScroll(e, "preview")}
              className="relative z-10 block px-3 py-1.5 transition-colors hover:text-zinc-100 cursor-pointer"
            >
              Live Preview
            </a>
          </div>

          {/* Student Dashboard */}
          <div
            ref={(el) => { navRefs.current.dashboard = el; }}
            onMouseEnter={() => handleNavEnter("dashboard")}
          >
            <Link
              href="/dashboard"
              className="relative z-10 block px-3 py-1.5 transition-colors hover:text-zinc-100"
            >
              Student Dashboard
            </Link>
          </div>
        </nav>

        {/* Action Buttons Right */}
        <div className="flex items-center gap-2.5 shrink-0">
          {!user ? (
            /* Glassy Sign In Button */
            <motion.div whileTap={{ scale: 0.96 }}>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="hidden sm:inline-flex bg-zinc-800/40 hover:bg-zinc-800/80 text-zinc-300 hover:text-zinc-100 border border-zinc-700/50 rounded-full px-3.5 h-8 text-xs font-medium backdrop-blur-md transition-all"
              >
                <Link href="/login">Sign In</Link>
              </Button>
            </motion.div>
          ) : (
            /* Compact Profile Dropdown Button */
            <div className="relative" ref={profileMenuRef}>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => setProfileOpen((prev) => !prev)}
                className="hidden sm:inline-flex items-center gap-2 bg-zinc-800/40 hover:bg-zinc-800/80 text-zinc-300 hover:text-zinc-100 border border-zinc-700/50 rounded-full px-2.5 py-1 h-8 text-xs font-medium backdrop-blur-md transition-all focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                aria-expanded={profileOpen}
                aria-label="User profile menu"
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-[10px]">
                  {getInitials(displayName)}
                </div>
                <span className="max-w-[100px] truncate text-xs font-medium text-zinc-200">
                  {displayName}
                </span>
                <ChevronDown className="h-3 w-3 text-zinc-400 shrink-0" />
              </motion.button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-zinc-800 bg-zinc-950/95 shadow-2xl shadow-black/80 backdrop-blur-2xl p-1.5 z-50 text-xs">
                  <div className="px-2.5 py-1.5 border-b border-zinc-800/80 mb-1">
                    <p className="font-semibold text-zinc-100 truncate">{displayName}</p>
                    <p className="text-[10px] text-zinc-400 truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-zinc-300 hover:bg-zinc-800/80 hover:text-zinc-100 transition-colors"
                  >
                    <User className="h-3.5 w-3.5 text-zinc-400" />
                    <span>Profile / Settings</span>
                  </Link>
                  {profile?.role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-amber-400 hover:bg-amber-500/10 transition-colors font-medium"
                    >
                      <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      signOut();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors text-left mt-1 border-t border-zinc-800/80 font-medium"
                  >
                    <LogOut className="h-3.5 w-3.5 text-rose-400" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Glassy Primary Start Assessment CTA */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <Button
              size="sm"
              asChild
              className="group bg-indigo-600/90 hover:bg-indigo-500 text-white border border-indigo-400/30 rounded-full px-4 h-8 text-xs font-semibold shadow-md shadow-indigo-950/50 backdrop-blur-md transition-all"
            >
              <Link href="/dashboard" className="flex items-center gap-1.5">
                <span>Start Assessment</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </header>
  );
}
