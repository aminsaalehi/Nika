/**
 * useHeroControls – Control panel: particle count (default 200) and color.
 */

"use client";

import { folder, useControls } from "leva";

export interface HeroControls {
  typographyTextLine1: string;
  typographyTextLine2: string;
  typographyLineMode: 1 | 2;
  typographyFont: string;
  typographyLineGap: number;
  particleCount: number;
  color: string;
  trailSpacing: number;
  particleSize: number;
  cursorInfluenceSize: number;
  particleShape: "circle" | "triangle" | "square";
  gradientEnabled: boolean;
  gradientStart: string;
  gradientEnd: string;
  backgroundColor: string;
  backgroundGridEnabled: boolean;
  contactButtonBackground: string;
  contactButtonBorderColor: string;
  contactButtonBorderStyle: "solid" | "dashed" | "dotted" | "double";
  projectTileTitle: string;
  projectTileUrl: string;
  projectTileThumbnailUrl: string;
  projectTileBackgroundColor: string;
  projectTileHeaderBackgroundColor: string;
  projectTileTextColor: string;
  projectTileBorderColor: string;
  projectTileBorderWidth: number;
  projectTileBorderRadius: number;
  projectTileShadowOpacity: number;
  projectTileBackdropBlur: number;
  projectTileTemplateColorA: string;
  projectTileTemplateColorB: string;
  projectTileTemplateColorC: string;
}

export function useHeroControls(): HeroControls {
  const controls = useControls("Hero Particles", {
    Typography: folder(
      {
        typographyTextLine1: "NIKA",
        typographyTextLine2: "AGENCY",
        typographyLineMode: {
          options: { "1 line": 1, "2 lines": 2 },
          value: 2,
        },
        typographyFont: {
          options: {
            Inter: "Inter, Arial, Helvetica, sans-serif",
            "Space Mono": "'Space Mono', Menlo, Monaco, Consolas, monospace",
            Trebuchet: "'Trebuchet MS', 'Segoe UI', Arial, sans-serif",
            Times: "'Times New Roman', Georgia, serif",
          },
          value: "Inter, Arial, Helvetica, sans-serif",
        },
        typographyLineGap: { value: 0.8, min: 0.8, max: 1.8, step: 0.02 },
      },
      { collapsed: false }
    ),
    Particles: folder(
      {
        particleCount: { value: 78, min: 10, max: 100, step: 1 },
        trailSpacing: { value: 0.5, min: 0.5, max: 3, step: 0.1 },
        particleSize: { value: 1.15, min: 0.1, max: 1.2, step: 0.05 },
        // 1.0 keeps today's tiny interaction; higher values provide a few larger steps.
        cursorInfluenceSize: { value: 3, min: 1, max: 4, step: 0.25 },
        particleShape: {
          options: {
            circle: "circle",
            triangle: "triangle",
            square: "square",
          },
          value: "circle",
        },
      },
      { collapsed: false }
    ),
    "Color/Gradient": folder(
      {
        gradientEnabled: false,
        color: "#ffffff",
        gradientStart: "#5f7cff",
        gradientEnd: "#b56dff",
      },
      { collapsed: false }
    ),
  });
  return {
    ...(controls as Omit<
      HeroControls,
      | "backgroundColor"
      | "backgroundGridEnabled"
      | "contactButtonBackground"
      | "contactButtonBorderColor"
      | "contactButtonBorderStyle"
      | "projectTileTitle"
      | "projectTileUrl"
      | "projectTileThumbnailUrl"
      | "projectTileBackgroundColor"
      | "projectTileHeaderBackgroundColor"
      | "projectTileTextColor"
      | "projectTileBorderColor"
      | "projectTileBorderWidth"
      | "projectTileBorderRadius"
      | "projectTileShadowOpacity"
      | "projectTileBackdropBlur"
      | "projectTileTemplateColorA"
      | "projectTileTemplateColorB"
      | "projectTileTemplateColorC"
    >),
    backgroundColor: "#0a0a0a",
    backgroundGridEnabled: true,
    contactButtonBackground: "rgba(0, 0, 0, 1)",
    contactButtonBorderColor: "rgba(255, 255, 255, 0.16)",
    contactButtonBorderStyle: "solid",
    projectTileTitle: "Ethical Life",
    projectTileUrl: "https://nika.agency/work/ethical-life/",
    projectTileThumbnailUrl: "/images/ethical-life.png",
    projectTileBackgroundColor: "rgba(26,30,38,0.76)",
    projectTileHeaderBackgroundColor: "rgba(0,0,0,0.45)",
    projectTileTextColor: "rgba(240,243,255,0.95)",
    projectTileBorderColor: "rgba(235,241,255,0.16)",
    projectTileBorderWidth: 1,
    projectTileBorderRadius: 2,
    projectTileShadowOpacity: 0.34,
    projectTileBackdropBlur: 4,
    projectTileTemplateColorA: "hsla(128 88% 70% / 0.42)",
    projectTileTemplateColorB: "hsla(289 80% 66% / 0.40)",
    projectTileTemplateColorC: "hsla(244 52% 30% / 0.86)",
  };
}
