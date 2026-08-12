"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BrainCircuit } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { CTASection } from "@/components/landing/cta-section";
import { Footer } from "@/components/layout/footer";

export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {loading && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background text-foreground"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
                <BrainCircuit className="h-6 w-6 animate-pulse" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-foreground">
                PARAKH
              </span>
            </motion.div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 100 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="h-0.5 bg-indigo-600 rounded-full mt-4"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1">
          <Hero />
          <Features />
          <CTASection />
        </main>
        <Footer />
      </div>
    </>
  );
}
