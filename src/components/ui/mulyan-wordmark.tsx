"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { useReducedMotion } from "motion/react";

// Dot-matrix geometric definitions for MULYAN characters (12-row matrix system)
const LETTER_DEFINITIONS = {
  M: {
    width: 10,
    dots: [
      // Left vertical stem (2-wide)
      [0, 0], [1, 0], [0, 1], [1, 1], [0, 2], [1, 2], [0, 3], [1, 3], [0, 4], [1, 4],
      [0, 5], [1, 5], [0, 6], [1, 6], [0, 7], [1, 7], [0, 8], [1, 8], [0, 9], [1, 9],
      [0, 10], [1, 10], [0, 11], [1, 11],
      // Right vertical stem (2-wide)
      [8, 0], [9, 0], [8, 1], [9, 1], [8, 2], [9, 2], [8, 3], [9, 3], [8, 4], [9, 4],
      [8, 5], [9, 5], [8, 6], [9, 6], [8, 7], [9, 7], [8, 8], [9, 8], [8, 9], [9, 9],
      [8, 10], [9, 10], [8, 11], [9, 11],
      // V-inner diagonal
      [2, 1], [2, 2], [3, 2], [3, 3], [4, 4], [5, 4], [6, 3], [6, 2], [7, 2], [7, 1],
      [4, 5], [5, 5],
    ],
  },
  U: {
    width: 9,
    dots: [
      // Left stem (2-wide)
      [0, 0], [1, 0], [0, 1], [1, 1], [0, 2], [1, 2], [0, 3], [1, 3], [0, 4], [1, 4],
      [0, 5], [1, 5], [0, 6], [1, 6], [0, 7], [1, 7], [0, 8], [1, 8], [0, 9], [1, 9],
      // Right stem (2-wide)
      [7, 0], [8, 0], [7, 1], [8, 1], [7, 2], [8, 2], [7, 3], [8, 3], [7, 4], [8, 4],
      [7, 5], [8, 5], [7, 6], [8, 6], [7, 7], [8, 7], [7, 8], [8, 8], [7, 9], [8, 9],
      // Bottom rounded curve
      [0, 10], [1, 10], [1, 11], [2, 10], [2, 11], [3, 10], [3, 11], [4, 10], [4, 11],
      [5, 10], [5, 11], [6, 10], [6, 11], [7, 10], [7, 11], [8, 10],
    ],
  },
  L: {
    width: 8,
    dots: [
      // Left vertical stem (2-wide)
      [0, 0], [1, 0], [0, 1], [1, 1], [0, 2], [1, 2], [0, 3], [1, 3], [0, 4], [1, 4],
      [0, 5], [1, 5], [0, 6], [1, 6], [0, 7], [1, 7], [0, 8], [1, 8], [0, 9], [1, 9],
      [0, 10], [1, 10], [0, 11], [1, 11],
      // Bottom horizontal foot (2-tall)
      [2, 10], [3, 10], [4, 10], [5, 10], [6, 10], [7, 10],
      [2, 11], [3, 11], [4, 11], [5, 11], [6, 11], [7, 11],
    ],
  },
  Y: {
    width: 9,
    dots: [
      // Left upper branch
      [0, 0], [1, 0], [0, 1], [1, 1], [1, 2], [2, 2], [2, 3], [3, 3], [2, 4], [3, 4], [3, 5], [4, 5],
      // Right upper branch
      [7, 0], [8, 0], [7, 1], [8, 1], [6, 2], [7, 2], [5, 3], [6, 3], [5, 4], [6, 4], [4, 5], [5, 5],
      // Center vertical stem (2-wide)
      [3, 6], [4, 6], [3, 7], [4, 7], [3, 8], [4, 8], [3, 9], [4, 9], [3, 10], [4, 10], [3, 11], [4, 11],
    ],
  },
  A: {
    width: 9,
    dots: [
      // Top curve
      [3, 0], [4, 0], [5, 0],
      [2, 1], [3, 1], [4, 1], [5, 1], [6, 1],
      // Left side leg
      [1, 2], [2, 2], [1, 3], [2, 3], [0, 4], [1, 4], [0, 5], [1, 5], [0, 6], [1, 6],
      [0, 7], [1, 7], [0, 8], [1, 8], [0, 9], [1, 9], [0, 10], [1, 10], [0, 11], [1, 11],
      // Right side leg
      [6, 2], [7, 2], [6, 3], [7, 3], [7, 4], [8, 4], [7, 5], [8, 5], [7, 6], [8, 6],
      [7, 7], [8, 7], [7, 8], [8, 8], [7, 9], [8, 9], [7, 10], [8, 10], [7, 11], [8, 11],
      // Crossbar
      [2, 6], [3, 6], [4, 6], [5, 6], [6, 6],
      [2, 7], [3, 7], [4, 7], [5, 7], [6, 7],
    ],
  },
  N: {
    width: 9,
    dots: [
      // Left vertical stem (2-wide)
      [0, 0], [1, 0], [0, 1], [1, 1], [0, 2], [1, 2], [0, 3], [1, 3], [0, 4], [1, 4],
      [0, 5], [1, 5], [0, 6], [1, 6], [0, 7], [1, 7], [0, 8], [1, 8], [0, 9], [1, 9],
      [0, 10], [1, 10], [0, 11], [1, 11],
      // Right vertical stem (2-wide)
      [7, 0], [8, 0], [7, 1], [8, 1], [7, 2], [8, 2], [7, 3], [8, 3], [7, 4], [8, 4],
      [7, 5], [8, 5], [7, 6], [8, 6], [7, 7], [8, 7], [7, 8], [8, 8], [7, 9], [8, 9],
      [7, 10], [8, 10], [7, 11], [8, 11],
      // Diagonal (2-wide)
      [2, 1], [2, 2], [2, 3], [3, 3], [3, 4], [3, 5], [4, 5], [4, 6], [4, 7], [5, 7], [5, 8], [5, 9], [6, 9], [6, 10],
    ],
  },
};

const SPACING = 12; // grid step in viewBox units
const LETTER_GAP = 32; // gap between characters in viewBox units
const DOT_RADIUS = 4.8; // radius of each circle dot
const PADDING_X = 14;
const PADDING_Y = 14;

// Physical interaction tuning
const REPEL_RADIUS = 85; // influence radius in viewBox pixels
const MAX_DISPLACEMENT = 16; // peak dispersion distance

interface DotCircle {
  id: string;
  cx: number;
  cy: number;
}

function computeDots(): { dots: DotCircle[]; width: number; height: number } {
  const dots: DotCircle[] = [];
  let curX = PADDING_X;

  for (const [letterKey, def] of Object.entries(LETTER_DEFINITIONS)) {
    def.dots.forEach(([col, row], idx) => {
      const cx = curX + col * SPACING;
      const cy = PADDING_Y + row * SPACING;
      dots.push({
        id: `${letterKey}-${idx}`,
        cx,
        cy,
      });
    });
    curX += (def.width - 1) * SPACING + LETTER_GAP;
  }

  const width = curX - LETTER_GAP + PADDING_X;
  const height = 11 * SPACING + PADDING_Y * 2;

  return { dots, width, height };
}

const { dots: CACHED_DOTS, width: VIEWBOX_WIDTH, height: VIEWBOX_HEIGHT } = computeDots();

interface MulyanWordmarkProps {
  className?: string;
  dotColor?: string;
}

export function MulyanWordmark({
  className = "w-full max-w-5xl h-auto",
  dotColor = "#FAFAFA",
}: MulyanWordmarkProps) {
  const shouldReduceMotion = useReducedMotion();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const circleRefs = useRef<(SVGCircleElement | null)[]>([]);

  // Array of current offsets for physics loop
  const offsets = useRef<{ x: number; y: number }[]>(
    CACHED_DOTS.map(() => ({ x: 0, y: 0 }))
  );
  const pointerInViewBox = useRef<{ x: number; y: number }>({ x: -9999, y: -9999 });
  const animFrameId = useRef<number | null>(null);
  const isLoopRunning = useRef(false);

  // Animation render loop
  const renderFrame = useCallback(() => {
    let maxOffset = 0;
    const px = pointerInViewBox.current.x;
    const py = pointerInViewBox.current.y;

    for (let i = 0; i < CACHED_DOTS.length; i++) {
      const dot = CACHED_DOTS[i];
      const el = circleRefs.current[i];
      if (!el) continue;

      let targetX = 0;
      let targetY = 0;

      if (px > -1000) {
        const dx = dot.cx - px;
        const dy = dot.cy - py;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < REPEL_RADIUS && dist > 0.001) {
          // Smooth quadratic falloff
          const t = 1 - dist / REPEL_RADIUS;
          const falloff = t * t;
          const force = falloff * MAX_DISPLACEMENT;
          targetX = (dx / dist) * force;
          targetY = (dy / dist) * force;
        }
      }

      // Fast spring-like interpolation (damping ~ 0.22)
      offsets.current[i].x += (targetX - offsets.current[i].x) * 0.22;
      offsets.current[i].y += (targetY - offsets.current[i].y) * 0.22;

      const ox = offsets.current[i].x;
      const oy = offsets.current[i].y;

      // Update DOM directly for max 60/120fps performance
      el.setAttribute("cx", (dot.cx + ox).toFixed(2));
      el.setAttribute("cy", (dot.cy + oy).toFixed(2));

      const displacement = Math.abs(ox) + Math.abs(oy);
      if (displacement > maxOffset) maxOffset = displacement;
    }

    // Stop loop when settled to save CPU/battery
    if (maxOffset < 0.04 && px < -1000) {
      for (let i = 0; i < CACHED_DOTS.length; i++) {
        offsets.current[i].x = 0;
        offsets.current[i].y = 0;
        circleRefs.current[i]?.setAttribute("cx", CACHED_DOTS[i].cx.toString());
        circleRefs.current[i]?.setAttribute("cy", CACHED_DOTS[i].cy.toString());
      }
      isLoopRunning.current = false;
      return;
    }

    animFrameId.current = requestAnimationFrame(renderFrame);
  }, []);

  const startLoop = useCallback(() => {
    if (!isLoopRunning.current) {
      isLoopRunning.current = true;
      animFrameId.current = requestAnimationFrame(renderFrame);
    }
  }, [renderFrame]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (shouldReduceMotion) return;
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const scaleX = VIEWBOX_WIDTH / rect.width;
      const scaleY = VIEWBOX_HEIGHT / rect.height;
      pointerInViewBox.current = {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
      startLoop();
    },
    [shouldReduceMotion, startLoop]
  );

  const handleMouseLeave = useCallback(() => {
    pointerInViewBox.current = { x: -9999, y: -9999 };
    startLoop();
  }, [startLoop]);

  useEffect(() => {
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, []);

  return (
    <div className="relative inline-flex items-center justify-center select-text">
      {/* Accessible text for screen readers and search engines */}
      <h1 className="sr-only">MULYAN</h1>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${className} cursor-pointer`}
        aria-hidden="true"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          <filter id="mulyan-dot-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="#000000" floodOpacity="0.5" />
          </filter>
        </defs>
        <g filter="url(#mulyan-dot-glow)">
          {CACHED_DOTS.map((dot, idx) => (
            <circle
              key={dot.id}
              ref={(el) => {
                circleRefs.current[idx] = el;
              }}
              cx={dot.cx}
              cy={dot.cy}
              r={DOT_RADIUS}
              fill={dotColor}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
