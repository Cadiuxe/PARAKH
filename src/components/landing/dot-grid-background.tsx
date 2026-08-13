"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

export function DotGridBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let running = true;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Size the canvas to fill its parent, accounting for device pixel ratio
    const setSize = () => {
      const section = canvas.parentElement;
      if (!section) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = section.offsetWidth;
      const cssH = section.offsetHeight;
      // Set canvas physical size
      canvas.width = cssW * dpr;
      canvas.height = cssH * dpr;
      // CSS size stays at 100%×100% via Tailwind
      width = cssW;
      height = cssH;
      ctx.scale(dpr, dpr);
    };
    setSize();

    // Raw pointer position in CSS pixels relative to canvas
    let mouseX = -9999;
    let mouseY = -9999;
    let scrollY = window.scrollY;

    // ── Grid constants ────────────────────────────────────────────────────────
    const SPACING = 26;         // px between dot centers (CSS pixels)
    const BASE_R = 1.0;         // resting radius
    const HOVER_R = 2.4;        // max radius under cursor
    const HOVER_DIST = 130;     // influence radius in px
    const BASE_ALPHA = 0.28;    // resting opacity — visible but quiet
    const HOVER_ALPHA = 0.85;   // peak opacity directly under cursor

    // ── Event handlers ────────────────────────────────────────────────────────

    const onResize = () => {
      // Reset transform before resizing to avoid stacking scales
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      setSize();
    };

    // Track mouse at window level so it works even when cursor is over
    // child elements (text, buttons) — then convert to canvas-local coords
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const onMouseLeave = (e: MouseEvent) => {
      // Only clear when pointer leaves the whole section
      const section = canvas.parentElement;
      if (!section) { mouseX = -9999; mouseY = -9999; return; }
      const rect = section.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      if (!inside) {
        mouseX = -9999;
        mouseY = -9999;
      }
    };

    const onScroll = () => {
      scrollY = window.scrollY;
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);

    // ── Render loop ───────────────────────────────────────────────────────────

    const render = () => {
      if (!running) return;
      animationFrameId = requestAnimationFrame(render);

      // Re-check size each frame in case of layout reflow
      const section = canvas.parentElement;
      if (section && (section.offsetWidth !== width || section.offsetHeight !== height)) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        setSize();
      }

      ctx.clearRect(0, 0, width, height);

      // Fade grid as hero scrolls past viewport
      const fadeFactor = Math.max(0, 1 - scrollY / (height * 0.9));
      if (fadeFactor <= 0) return;

      // Very restrained parallax upward drift
      const parallaxOffsetY = scrollY * 0.05;

      const cols = Math.ceil(width / SPACING) + 2;
      const rows = Math.ceil(height / SPACING) + 2;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * SPACING + SPACING * 0.5;
          const y = r * SPACING + SPACING * 0.5 - parallaxOffsetY;

          if (y < -SPACING || y > height + SPACING) continue;

          let alpha = BASE_ALPHA;
          let radius = BASE_R;

          if (!shouldReduceMotion && mouseX > -9000) {
            const dx = mouseX - x;
            const dy = mouseY - y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < HOVER_DIST) {
              // Smoothstep falloff — physically believable, not sharp
              const t = 1 - dist / HOVER_DIST;
              const falloff = t * t * (3 - 2 * t);
              alpha = BASE_ALPHA + (HOVER_ALPHA - BASE_ALPHA) * falloff;
              radius = BASE_R + (HOVER_R - BASE_R) * falloff;
            }
          }

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(228, 228, 231, ${(alpha * fadeFactor).toFixed(3)})`;
          ctx.fill();
        }
      }
    };

    if (shouldReduceMotion) {
      // Single static render — no loop
      ctx.clearRect(0, 0, width, height);
      const rows = Math.ceil(height / SPACING) + 2;
      const cols = Math.ceil(width / SPACING) + 2;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * SPACING + SPACING * 0.5;
          const y = r * SPACING + SPACING * 0.5;
          ctx.beginPath();
          ctx.arc(x, y, BASE_R, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(228, 228, 231, ${BASE_ALPHA})`;
          ctx.fill();
        }
      }
    } else {
      render();
    }

    return () => {
      running = false;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [shouldReduceMotion]);

  return (
    <canvas
      ref={canvasRef}
      // z-0 keeps the canvas in normal stacking, below the z-10 content div
      // but above the page background (which has no z-index / z=auto)
      // pointer-events-none ensures clicks pass through to buttons/links
      className="absolute inset-0 pointer-events-none w-full h-full"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
