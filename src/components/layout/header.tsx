"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrainCircuit, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { AdaptiveLogicDialog } from "@/components/landing/adaptive-logic-dialog";

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

        {/* Centered Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-zinc-400">
          <a
            href="#features"
            onClick={(e) => handleSectionScroll(e, "features")}
            className="transition-colors hover:text-zinc-100 cursor-pointer"
          >
            Platform Capabilities
          </a>

          {/* Functional Adaptive Logic Dialog trigger without blue dot */}
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

          <a
            href="#preview"
            onClick={(e) => handleSectionScroll(e, "preview")}
            className="transition-colors hover:text-zinc-100 cursor-pointer"
          >
            Live Preview
          </a>

          <Link href="/dashboard" className="transition-colors hover:text-zinc-100">
            Student Dashboard
          </Link>
        </nav>

        {/* Action Buttons Right */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Glassy Sign In Button */}
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
