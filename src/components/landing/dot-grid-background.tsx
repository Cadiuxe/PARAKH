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
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    let mouseX = -1000;
    let mouseY = -1000;
    let scrollY = window.scrollY;

    const gridSpacing = 28;
    const baseRadius = 1.2;
    const hoverRadius = 130;

    // Resize listener
    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    // Mouse listener (desktop only)
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    // Scroll listener
    const handleScroll = () => {
      scrollY = window.scrollY;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Attach mouse listeners to parent container if available
    const parent = canvas.parentElement || window;
    parent.addEventListener("mousemove", handleMouseMove as any);
    parent.addEventListener("mouseleave", handleMouseLeave as any);

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Fade grid as hero leaves viewport
      const fadeFactor = Math.max(0, 1 - scrollY / (height * 0.9));
      if (fadeFactor <= 0) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const rows = Math.ceil(height / gridSpacing);
      const cols = Math.ceil(width / gridSpacing);

      // Subtle parallax offset
      const parallaxY = scrollY * 0.12;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const defaultX = c * gridSpacing + gridSpacing / 2;
          const defaultY = r * gridSpacing + gridSpacing / 2 - parallaxY;

          // Skip drawing if outside visible canvas
          if (defaultY < -10 || defaultY > height + 10) continue;

          let dotX = defaultX;
          let dotY = defaultY;
          let currentRadius = baseRadius;
          let alpha = 0.18 * fadeFactor;

          if (!shouldReduceMotion && mouseX > 0 && mouseY > 0) {
            const dx = mouseX - defaultX;
            const dy = mouseY - defaultY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < hoverRadius) {
              const factor = 1 - dist / hoverRadius;
              // Subtle position displacement
              const moveAmount = factor * 4;
              dotX = defaultX + (dx / dist) * moveAmount;
              dotY = defaultY + (dy / dist) * moveAmount;

              // Radius & Brightness increase
              currentRadius = baseRadius + factor * 1.5;
              alpha = (0.18 + factor * 0.45) * fadeFactor;
            }
          }

          ctx.beginPath();
          ctx.arc(dotX, dotY, currentRadius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(161, 161, 170, ${alpha})`;
          ctx.fill();
        }
      }

      if (!shouldReduceMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      parent.removeEventListener("mousemove", handleMouseMove as any);
      parent.removeEventListener("mouseleave", handleMouseLeave as any);
    };
  }, [shouldReduceMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none -z-10 w-full h-full"
      aria-hidden="true"
    />
  );
}
