/**
 * HeroParticles – Simple particle section: tiny dots that follow the cursor.
 * Control panel: particle count (default 200) and color.
 */

"use client";

import { Suspense, useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { ParticleField } from "./ParticleField";
import { useHeroControls } from "./hooks/useHeroControls";
import { useCursorPosition } from "./hooks/useCursorPosition";
import { ProjectTilesOverlay } from "@/components/ProjectTilesOverlay";

const isDev = process.env.NODE_ENV === "development";
const GRAIN_TEXTURE_URL =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='0.85'/%3E%3C/svg%3E\")";
const PIXEL_GRID_TEXTURE_URL =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Crect x='0' y='0' width='1' height='1' fill='white' fill-opacity='0.05'/%3E%3C/svg%3E\")";
const CONTACT_DOT_OFFSETS = [-26, -18, -10, -2, 6, 14, 22];
const CONNECT_COLUMN_WIDTH = 320;

export function HeroParticles() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [contactHovered, setContactHovered] = useState(false);
  const [controlsMinimized, setControlsMinimized] = useState(true);
  const cursorNdc = useCursorPosition(containerRef);
  const controls = useHeroControls();
  const lineMode = Number(controls.typographyLineMode) === 2 ? 2 : 1;
  const line1 = (controls.typographyTextLine1 || "PARTICLES").slice(0, 27);
  const line2 = (controls.typographyTextLine2 || "SAN JOSE").slice(0, 27);
  const displayText = lineMode === 1 ? line1 : `${line1}\n${line2}`.trim();
  const fontFamily = controls.typographyFont || "Inter, Arial, Helvetica, sans-serif";
  const backgroundColor = controls.backgroundColor || "#0a0a0a";
  const backgroundGridEnabled = controls.backgroundGridEnabled !== false;
  const contactButtonBackground = controls.contactButtonBackground || "rgba(0, 0, 0, 1)";
  const contactButtonBorderColor = controls.contactButtonBorderColor || "rgba(255, 255, 255, 0.16)";
  const contactButtonBorderStyle = controls.contactButtonBorderStyle || "solid";

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const exportImage = async (format: "png" | "jpeg" | "svg") => {
    const canvas = containerRef.current?.querySelector("canvas");
    if (!canvas) return;
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    const nowStamp = new Date().toISOString().replace(/[:.]/g, "-");
    const width = canvas.width;
    const height = canvas.height;

    if (format === "png") {
      canvas.toBlob((blob) => {
        if (blob) downloadBlob(blob, `hero-particles-${nowStamp}.png`);
      }, "image/png");
      return;
    }

    if (format === "jpeg") {
      const jpegCanvas = document.createElement("canvas");
      jpegCanvas.width = width;
      jpegCanvas.height = height;
      const ctx = jpegCanvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(canvas, 0, 0, width, height);
      jpegCanvas.toBlob((blob) => {
        if (blob) downloadBlob(blob, `hero-particles-${nowStamp}.jpg`);
      }, "image/jpeg", 0.96);
      return;
    }

    const pngData = canvas.toDataURL("image/png");
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="${backgroundColor}" />
  <image href="${pngData}" x="0" y="0" width="${width}" height="${height}" />
</svg>`;
    downloadBlob(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }), `hero-particles-${nowStamp}.svg`);
  };

  const sanJoseTime = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(now);

  const sanJoseDate = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    weekday: "short",
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(now);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full min-h-screen"
      style={{
        background: backgroundColor,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
      }}
    >
      {isDev && (
        <>
          {controlsMinimized && (
          <button
            type="button"
            onClick={() => setControlsMinimized(false)}
            style={{
              position: "fixed",
              right: 14,
              bottom: 14,
              zIndex: 10020,
              pointerEvents: "auto",
              height: 34,
              padding: "0 12px",
              border: "1px solid rgba(255, 255, 255, 0.14)",
              borderRadius: 999,
              background: "rgba(10, 10, 10, 0.84)",
              color: "rgba(240, 244, 255, 0.88)",
              fontFamily: "Inter, Arial, Helvetica, sans-serif",
              fontSize: 11,
              letterSpacing: "0.02em",
              cursor: "pointer",
              backdropFilter: "blur(8px)",
            }}
            aria-label="Expand controls"
          >
            Control
          </button>
          )}
          <div
            style={{
              position: "fixed",
              right: 14,
              top: 14,
              bottom: 14,
              width: CONNECT_COLUMN_WIDTH,
              zIndex: 10020,
              pointerEvents: "auto",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 8,
              background: "rgba(10, 10, 10, 0.78)",
              backdropFilter: "blur(12px)",
              padding: "10px 8px 12px",
              overflowY: "auto",
              display: controlsMinimized ? "none" : "block",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
                color: "rgba(236, 242, 255, 0.86)",
                fontFamily: "Inter, Arial, Helvetica, sans-serif",
                fontSize: 11,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              <span>Control</span>
              <button
                type="button"
                onClick={() => setControlsMinimized(true)}
                style={{
                  all: "unset",
                  cursor: "pointer",
                  color: "rgba(218, 227, 245, 0.76)",
                  fontSize: 11,
                  letterSpacing: "0.03em",
                  textTransform: "uppercase",
                }}
              >
                Minimize
              </button>
            </div>
            <div>
              <Leva
                hidden={controlsMinimized}
                titleBar={false}
                fill
                flat
                oneLineLabels={false}
                hideCopyButton
                theme={{
                  fonts: {
                    mono: "Inter, Arial, Helvetica, sans-serif",
                    sans: "Inter, Arial, Helvetica, sans-serif",
                  },
                  fontSizes: {
                    root: "11px",
                    toolTip: "10px",
                  },
                  sizes: {
                    rootWidth: "100%",
                    controlWidth: "94px",
                    rowHeight: "26px",
                    titleBarHeight: "30px",
                  },
                  radii: {
                    xs: "4px",
                    sm: "6px",
                    lg: "8px",
                  },
                  colors: {
                    elevation1: "rgba(16,16,16,0.55)",
                    elevation2: "rgba(20,20,20,0.64)",
                    elevation3: "rgba(79,79,79,0.74)",
                    accent1: "rgba(255,255,255,0.1)",
                    accent2: "rgba(255,255,255,0.2)",
                    accent3: "rgba(255,255,255,0.3)",
                    highlight1: "rgba(220,232,255,0.95)",
                    highlight2: "rgba(220,232,255,0.78)",
                    highlight3: "rgba(220,232,255,0.6)",
                    vivid1: "rgba(130,160,255,0.95)",
                    folderWidgetColor: "rgba(140,171,255,0.85)",
                    folderTextColor: "rgba(220,232,255,0.9)",
                    toolTipBackground: "rgba(12,12,12,0.94)",
                    toolTipText: "rgba(232,240,255,0.9)",
                  },
                }}
              />
            </div>
          </div>
        </>
      )}
      <div
        style={{
          position: "fixed",
          top: 14,
          left: 14,
          right: 14,
          zIndex: 10001,
          pointerEvents: "none",
          color: "rgba(236,239,245,0.82)",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          fontSize: 9,
          letterSpacing: "0.035em",
          lineHeight: 1.35,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 1.35fr 1.35fr 1fr auto",
            columnGap: 54,
            alignItems: "start",
          }}
        >
          <section>
            <div style={{ color: "#88a8ff", fontSize: 8, letterSpacing: "0.12em", marginBottom: 8 }}>◉ INTRO</div>
            <div style={{ color: "rgba(243,247,255,0.92)" }}>NIKA</div>
            <div style={{ color: "rgba(192,201,218,0.72)" }}>AGENCY</div>
            <button
              type="button"
              onMouseEnter={() => setContactHovered(true)}
              onMouseLeave={() => setContactHovered(false)}
              onFocus={() => setContactHovered(true)}
              onBlur={() => setContactHovered(false)}
              style={{
                marginTop: 8,
                width: 118,
                height: 28,
                borderRadius: 999,
                border: `1px ${contactButtonBorderStyle} ${contactButtonBorderColor}`,
                background: contactButtonBackground,
                boxShadow: contactHovered
                  ? "inset 0 0 0 1px rgba(140,169,255,0.2), 0 4px 14px rgba(0,0,0,0.24)"
                  : "inset 0 0 0 1px rgba(140,169,255,0.1)",
                position: "relative",
                overflow: "hidden",
                pointerEvents: "auto",
                cursor: "pointer",
                transition: "background 240ms ease, border-color 240ms ease, box-shadow 240ms ease",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: contactHovered ? 0 : 1,
                  transform: contactHovered ? "scale(0.985)" : "scale(1)",
                  transition: "opacity 240ms ease, transform 320ms ease",
                }}
              >
                {CONTACT_DOT_OFFSETS.map((offset, index) => (
                  <span
                    key={index}
                    style={{
                      position: "absolute",
                      left: `calc(50% + ${offset}px)`,
                      top: "50%",
                      width: 3,
                      height: 3,
                      borderRadius: "50%",
                      background: "rgba(229,237,255,0.9)",
                      transform: "translate(-50%, -50%)",
                      animation: `pillDotDrift 1.8s ease-in-out ${index * 90}ms infinite, pillDotGlow 2.4s ease-in-out ${index * 70}ms infinite`,
                    }}
                  />
                ))}
              </span>
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgba(235,242,255,0.92)",
                  fontSize: 9,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  opacity: contactHovered ? 1 : 0,
                  transform: contactHovered ? "translateY(0)" : "translateY(4px)",
                  transition: "opacity 260ms ease, transform 260ms ease",
                }}
              >
                Contact us
              </span>
            </button>
            <div style={{ marginTop: 10, color: "rgba(190,200,214,0.72)" }}>Award-winning digital agency</div>
            <div style={{ marginTop: 6, color: "rgba(129,149,189,0.78)" }}>Silicon Valley / NYC</div>
          </section>

          <section>
            <div style={{ color: "#88a8ff", fontSize: 8, letterSpacing: "0.12em", marginBottom: 8 }}>◉ CAPABILITIES</div>
            <div>Services: Branding, Websites, Product</div>
            <div>Approach: Strategy × Data × Tech</div>
            <div>Focus: Best-in-class brand experiences</div>
            <div style={{ marginTop: 8 }}>Since: 2010</div>
          </section>

          <section>
            <div style={{ color: "#88a8ff", fontSize: 8, letterSpacing: "0.12em", marginBottom: 8 }}>◉ RECOGNITION</div>
            <div>06× Awwwards</div>
            <div>05× Clutch Awards</div>
            <div>21× American Advertising Awards</div>
            <div>04× CSS Design Awards</div>
            <div>03× The FWA</div>
          </section>

          <section>
            <div style={{ color: "#88a8ff", fontSize: 8, letterSpacing: "0.12em", marginBottom: 8 }}>◉ BRANDS</div>
            <div>Airbus (Acubed)</div>
            <div>Ethical Life</div>
            <div>Atmosic</div>
            <div>Auradine</div>
            <div>Copilot</div>
            <div>Augustana</div>
          </section>

          <section style={{ textAlign: "left", minWidth: 170 }}>
            <div style={{ color: "#88a8ff", fontSize: 8, letterSpacing: "0.12em", marginBottom: 8 }}>◉ CONNECT</div>
            <div>Email: contact@nika.agency</div>
            <div>LinkedIn</div>
            <div>Instagram</div>
            <div>+1 669 306 5012</div>
            <div style={{ marginTop: 10, color: "rgba(228,235,246,0.92)" }}>{sanJoseTime}</div>
            <div style={{ color: "rgba(179,191,214,0.74)" }}>{sanJoseDate} PST/PDT</div>
            <div style={{ marginTop: 10, display: "flex", gap: 8, pointerEvents: "auto" }}>
              <button
                onClick={() => void exportImage("png")}
                style={{
                  all: "unset",
                  cursor: "pointer",
                  color: "rgba(214,225,245,0.86)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Export PNG
              </button>
              <button
                onClick={() => void exportImage("jpeg")}
                style={{
                  all: "unset",
                  cursor: "pointer",
                  color: "rgba(214,225,245,0.86)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Export JPG
              </button>
              <button
                onClick={() => void exportImage("svg")}
                style={{
                  all: "unset",
                  cursor: "pointer",
                  color: "rgba(214,225,245,0.86)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Export SVG
              </button>
            </div>
          </section>
        </div>
      </div>
      {!mounted ? (
        <div className="w-full h-full" style={{ background: backgroundColor }} />
      ) : (
        <Suspense fallback={<div className="w-full h-full" style={{ background: backgroundColor }} />}>
          <Canvas
            camera={{ position: [0, 0, 2.5], fov: 50 }}
            gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }}
            style={{ width: "100%", height: "100%", display: "block" }}
            frameloop="always"
          >
            <ParticleField
              cursorNdc={cursorNdc}
              controls={controls}
              text={displayText}
              fontFamily={fontFamily}
              maxLines={lineMode}
              backgroundColor={backgroundColor}
            />
          </Canvas>
          {backgroundGridEnabled && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                zIndex: 1,
                backgroundImage: PIXEL_GRID_TEXTURE_URL,
                backgroundRepeat: "repeat",
                opacity: 0.8,
              }}
            />
          )}
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              zIndex: 2,
              opacity: 0.1,
              mixBlendMode: "soft-light",
              backgroundImage: [
                "radial-gradient(circle at 12% 18%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 35%, transparent 62%)",
                "radial-gradient(circle at 82% 84%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.015) 30%, transparent 58%)",
                "linear-gradient(120deg, rgba(255,255,255,0.04) 0%, transparent 40%, rgba(255,255,255,0.03) 66%, transparent 100%)",
                GRAIN_TEXTURE_URL,
              ].join(", "),
              backgroundSize: "100% 100%, 100% 100%, 180% 180%, 260px 260px",
              animation: "grainShift 9s steps(7) infinite, atmosphereDrift 22s ease-in-out infinite",
            }}
          />
          <ProjectTilesOverlay controls={controls} />
        </Suspense>
      )}
      <div
        style={{
          position: "fixed",
          left: "50%",
          bottom: 18,
          width: 4,
          height: 4,
          borderRadius: "50%",
          transform: "translateX(-50%)",
          background: "#6e8fff",
          boxShadow: "0 0 8px rgba(110,143,255,0.6)",
          zIndex: 10001,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
