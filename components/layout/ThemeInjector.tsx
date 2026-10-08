import React from "react";
import { prisma } from "@/lib/prisma";

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1] as string, 16),
    g: parseInt(result[2] as string, 16),
    b: parseInt(result[3] as string, 16)
  } : { r: 57, g: 169, b: 0 }; // Default Verde SENA
}

function adjustBrightness(rgb: {r: number, g: number, b: number}, factor: number) {
  return {
    r: Math.min(255, Math.max(0, Math.round(rgb.r + (255 - rgb.r) * (1 - factor)))),
    g: Math.min(255, Math.max(0, Math.round(rgb.g + (255 - rgb.g) * (1 - factor)))),
    b: Math.min(255, Math.max(0, Math.round(rgb.b + (255 - rgb.b) * (1 - factor))))
  };
}

function adjustDarkness(rgb: {r: number, g: number, b: number}, factor: number) {
  return {
    r: Math.min(255, Math.max(0, Math.round(rgb.r * factor))),
    g: Math.min(255, Math.max(0, Math.round(rgb.g * factor))),
    b: Math.min(255, Math.max(0, Math.round(rgb.b * factor)))
  };
}

function rgbToHex(rgb: {r: number, g: number, b: number}) {
  return "#" + (1 << 24 | rgb.r << 16 | rgb.g << 8 | rgb.b).toString(16).slice(1).toUpperCase();
}

function generatePalette(hex: string) {
  const rgb = hexToRgb(hex);
  return {
    50: rgbToHex(adjustBrightness(rgb, 0.1)),
    100: rgbToHex(adjustBrightness(rgb, 0.2)),
    200: rgbToHex(adjustBrightness(rgb, 0.4)),
    300: rgbToHex(adjustBrightness(rgb, 0.6)),
    400: rgbToHex(adjustBrightness(rgb, 0.8)),
    500: hex,
    600: rgbToHex(adjustDarkness(rgb, 0.9)),
    700: rgbToHex(adjustDarkness(rgb, 0.7)),
    800: rgbToHex(adjustDarkness(rgb, 0.5)),
    900: rgbToHex(adjustDarkness(rgb, 0.4)),
    950: rgbToHex(adjustDarkness(rgb, 0.2)),
  };
}

export async function ThemeInjector() {
  try {
    const config = await prisma.configuracionSistema.findFirst();
    if (!config) return null;

    const principal = generatePalette(config.colorPrincipal || "#39A900");
    // Secundario asumiendo que el 900 es el color de entrada como lo es #00304D
    const secRgb = hexToRgb(config.colorSecundario || "#00304D");
    const secundario = {
      50: rgbToHex(adjustBrightness(secRgb, 0.1)),
      100: rgbToHex(adjustBrightness(secRgb, 0.2)),
      200: rgbToHex(adjustBrightness(secRgb, 0.4)),
      300: rgbToHex(adjustBrightness(secRgb, 0.6)),
      400: rgbToHex(adjustBrightness(secRgb, 0.8)),
      500: rgbToHex(adjustBrightness(secRgb, 0.9)),
      600: rgbToHex(adjustBrightness(secRgb, 0.95)),
      700: rgbToHex(adjustDarkness(secRgb, 0.9)),
      800: rgbToHex(adjustDarkness(secRgb, 0.95)),
      900: config.colorSecundario || "#00304D",
    };

    const cssString = `
      :root {
        --color-verde-50: ${principal[50]};
        --color-verde-100: ${principal[100]};
        --color-verde-200: ${principal[200]};
        --color-verde-300: ${principal[300]};
        --color-verde-400: ${principal[400]};
        --color-verde-500: ${principal[500]};
        --color-verde-600: ${principal[600]};
        --color-verde-700: ${principal[700]};
        --color-verde-800: ${principal[800]};
        --color-verde-900: ${principal[900]};
        
        --color-sena-50: ${secundario[50]};
        --color-sena-100: ${secundario[100]};
        --color-sena-200: ${secundario[200]};
        --color-sena-300: ${secundario[300]};
        --color-sena-400: ${secundario[400]};
        --color-sena-500: ${secundario[500]};
        --color-sena-600: ${secundario[600]};
        --color-sena-700: ${secundario[700]};
        --color-sena-800: ${secundario[800]};
        --color-sena-900: ${secundario[900]};
      }
    `;

    return <style dangerouslySetInnerHTML={{ __html: cssString }} />;
  } catch (error) {
    console.error("Error in ThemeInjector:", error);
    return null;
  }
}
