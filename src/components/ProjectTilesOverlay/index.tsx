"use client";

import { useEffect, useState, useRef, type PointerEvent as ReactPointerEvent } from "react";
import type { HeroControls } from "@/components/HeroParticles/hooks/useHeroControls";

const BASE_TILE_WIDTH = 200;
const BASE_TILE_HEIGHT = 200;
const DRAG_CLICK_THRESHOLD = 6;
const DEFAULT_TILE_LEFT = 240;
const DEFAULT_TILE_TOP = 768;

interface ProjectTile {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string;
  x: number;
  y: number;
  isClosed: boolean;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function makeTemplateStyle(controls: HeroControls) {
  return {
    backgroundImage: [
      `radial-gradient(circle at 18% 24%, ${controls.projectTileTemplateColorA}, transparent 48%)`,
      `radial-gradient(circle at 82% 76%, ${controls.projectTileTemplateColorB}, transparent 44%)`,
      `linear-gradient(125deg, ${controls.projectTileTemplateColorC}, rgba(15,17,24,0.92))`,
    ].join(", "),
  };
}

export function ProjectTilesOverlay({ controls }: { controls: HeroControls }) {
  const [tiles, setTiles] = useState<ProjectTile[]>([]);
  const tilesRef = useRef<ProjectTile[]>([]);
  const [dragging, setDragging] = useState(false);
  const dragStateRef = useRef<{
    tileId: string;
    offsetX: number;
    offsetY: number;
    pointerDownX: number;
    pointerDownY: number;
  } | null>(null);
  const movedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const seedProjects = [
      {
        id: "ethical",
        title: controls.projectTileTitle,
        url: controls.projectTileUrl,
        thumbnailUrl: controls.projectTileThumbnailUrl,
        x: DEFAULT_TILE_LEFT,
        y: DEFAULT_TILE_TOP,
      },
      {
        id: "atmosic",
        title: "Atmosic",
        url: "https://nika.agency/work/atmosic/",
        thumbnailUrl: "/images/atmosic.png",
        x: 486,
        y: 120,
      },
      {
        id: "basedai",
        title: "BasedAI",
        url: "https://nika.agency/work/basedai/",
        thumbnailUrl: "/images/basedai.png",
        x: 864,
        y: 420,
      },
      {
        id: "auradine",
        title: "Auradine",
        url: "https://nika.agency/work/auradine/",
        thumbnailUrl: "/images/auradine.png",
        x: 1020,
        y: 116,
      },
      {
        id: "copilot",
        title: "Copilot",
        url: "https://nika.agency/work/copilot/",
        thumbnailUrl: "/images/copilot.png",
        x: 260,
        y: 330,
      },
      {
        id: "merlin",
        title: "Merlin",
        url: "https://nika.agency/work/merlin/",
        thumbnailUrl: "/images/merlin.png",
        x: 700,
        y: 86,
      },
      {
        id: "upscale",
        title: "Upscale",
        url: "https://nika.agency/work/upscale/",
        thumbnailUrl: "/images/upscale.png",
        x: 1110,
        y: 360,
      },
    ] as const;

    const initialTiles = seedProjects.map((project) => ({
      ...project,
      x: clamp(project.x, 10, Math.max(10, viewportWidth - BASE_TILE_WIDTH - 10)),
      y: clamp(project.y, 10, Math.max(10, viewportHeight - BASE_TILE_HEIGHT - 10)),
      isClosed: false,
    }));

    tilesRef.current = initialTiles;
    setTiles(initialTiles);
  }, []);

  useEffect(() => {
    setTiles((prev) => {
      if (prev.length === 0) return prev;
      const next = prev.map((tile) =>
        tile.id === "ethical"
          ? {
              ...tile,
              title: controls.projectTileTitle,
              url: controls.projectTileUrl,
              thumbnailUrl: controls.projectTileThumbnailUrl,
            }
          : tile
      );
      tilesRef.current = next;
      return next;
    });
  }, [controls.projectTileTitle, controls.projectTileUrl, controls.projectTileThumbnailUrl]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const drag = dragStateRef.current;
      if (!drag) return;

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      setTiles((prev) => {
        const tileIndex = prev.findIndex((tile) => tile.id === drag.tileId && !tile.isClosed);
        if (tileIndex === -1) return prev;
        const nextTiles = [...prev];
        const currentTile = nextTiles[tileIndex];
        if (!currentTile) return prev;
        const movedTile = {
          ...currentTile,
          x: clamp(Math.round(event.clientX - drag.offsetX), 0, viewportWidth - BASE_TILE_WIDTH),
          y: clamp(Math.round(event.clientY - drag.offsetY), 0, viewportHeight - BASE_TILE_HEIGHT),
        };
        nextTiles[tileIndex] = movedTile;
        tilesRef.current = nextTiles;
        return nextTiles;
      });

      const movedDistance = Math.hypot(event.clientX - drag.pointerDownX, event.clientY - drag.pointerDownY);
      if (movedDistance > DRAG_CLICK_THRESHOLD) {
        movedRef.current = true;
      }
    };

    const handlePointerUp = () => {
      setTimeout(() => {
        movedRef.current = false;
      }, 0);
      dragStateRef.current = null;
      setDragging(false);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      setTiles((prev) => {
        if (prev.length === 0) return prev;
        const next = prev.map((tile) => ({
          ...tile,
          x: clamp(tile.x, 0, Math.max(0, viewportWidth - BASE_TILE_WIDTH)),
          y: clamp(tile.y, 0, Math.max(0, viewportHeight - BASE_TILE_HEIGHT)),
        }));
        tilesRef.current = next;
        return next;
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const onDragStart = (event: ReactPointerEvent<HTMLDivElement>, tileId: string) => {
    const currentTile = tilesRef.current.find((tile) => tile.id === tileId);
    if (!currentTile || currentTile.isClosed) return;

    const target = event.target as HTMLElement;
    if (target.closest("[data-no-drag='true']")) return;

    setTiles((prev) => {
      const tileIndex = prev.findIndex((tile) => tile.id === tileId);
      if (tileIndex === -1) return prev;
      const ordered = [...prev];
      const [activeTile] = ordered.splice(tileIndex, 1);
      if (!activeTile) return prev;
      ordered.push(activeTile);
      tilesRef.current = ordered;
      return ordered;
    });

    dragStateRef.current = {
      tileId,
      offsetX: event.clientX - currentTile.x,
      offsetY: event.clientY - currentTile.y,
      pointerDownX: event.clientX,
      pointerDownY: event.clientY,
    };
    movedRef.current = false;
    setDragging(true);
  };

  const closeTile = (tileId: string) => {
    setTiles((prev) => {
      const next = prev.map((tile) => (tile.id === tileId ? { ...tile, isClosed: true } : tile));
      tilesRef.current = next;
      return next;
    });
  };

  const openTileUrl = (tile: ProjectTile) => {
    if (movedRef.current) return;
    window.location.href = tile.url;
  };

  const shadowAlpha = clamp(Number(controls.projectTileShadowOpacity) || 0, 0, 0.95);
  const borderWidth = Math.max(0, Number(controls.projectTileBorderWidth) || 0);
  const borderRadius = Math.max(0, Number(controls.projectTileBorderRadius) || 0);
  const blur = Math.max(0, Number(controls.projectTileBackdropBlur) || 0);
  const headerBorderColor = "rgba(235,241,255,0.2)";
  const templateStyle = makeTemplateStyle(controls);
  const visibleTiles = tiles.filter((tile) => !tile.isClosed);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9000,
        pointerEvents: "none",
      }}
    >
      {visibleTiles.map((tile, index) => (
        <div
          key={tile.id}
          onPointerDown={(event) => onDragStart(event, tile.id)}
          style={{
            position: "absolute",
            left: tile.x,
            top: tile.y,
            width: BASE_TILE_WIDTH,
            height: BASE_TILE_HEIGHT,
            borderRadius,
            border: `${borderWidth}px solid ${controls.projectTileBorderColor}`,
            background: controls.projectTileBackgroundColor,
            boxShadow: dragging ? `0 16px 35px rgba(0,0,0,${shadowAlpha + 0.08})` : `0 8px 22px rgba(0,0,0,${shadowAlpha})`,
            backdropFilter: `blur(${blur}px)`,
            overflow: "hidden",
            pointerEvents: "auto",
            cursor: dragging ? "grabbing" : "grab",
            userSelect: "none",
            zIndex: 9100 + index,
          }}
        >
          <div
            style={{
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 10px",
              color: controls.projectTileTextColor,
              fontSize: 11,
              letterSpacing: "0.03em",
              borderBottom: `1px solid ${headerBorderColor}`,
              background: controls.projectTileHeaderBackgroundColor,
            }}
          >
            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tile.title}</span>
            <button
              type="button"
              aria-label={`Close ${tile.title}`}
              data-no-drag="true"
              onClick={() => closeTile(tile.id)}
              style={{
                all: "unset",
                width: 18,
                height: 18,
                display: "grid",
                placeItems: "center",
                fontSize: 14,
                lineHeight: 1,
                color: controls.projectTileTextColor,
                borderRadius: "50%",
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </div>

          <button
            type="button"
            data-no-drag="true"
            onClick={() => openTileUrl(tile)}
            style={{
              all: "unset",
              display: "block",
              width: "100%",
              height: "100%",
              cursor: "pointer",
              background: tile.thumbnailUrl
                ? `center / cover no-repeat url("${tile.thumbnailUrl}")`
                : templateStyle.backgroundImage,
            }}
            title={`Open ${tile.title}`}
          />
        </div>
      ))}

      {visibleTiles.length === 0 && (
        <div
          style={{
            position: "fixed",
            bottom: 22,
            right: 22,
            color: "rgba(234,240,255,0.78)",
            fontSize: 11,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            background: "rgba(14,18,28,0.72)",
            border: "1px solid rgba(193,205,235,0.3)",
            borderRadius: 8,
            padding: "7px 10px",
            pointerEvents: "auto",
          }}
        >
          All project tiles are closed
        </div>
      )}
    </div>
  );
}
