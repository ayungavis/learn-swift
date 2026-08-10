import type { CSSProperties } from "react";

export type Direction = "vertical" | "horizontal";
export type Justify = "start" | "center" | "end" | "spaceBetween" | "spaceAround";
export type Align = "leading" | "center" | "trailing" | "stretch";
export type SizeMode = "fit" | "fill" | "fixed";

export interface LayoutConfig {
  direction: Direction;
  justify: Justify;
  align: Align;
  spacing: number;
  horizontalPadding: number;
  verticalPadding: number;
  width: SizeMode;
  height: SizeMode;
  fixedWidth: number;
  fixedHeight: number;
}

export interface PlaygroundPreset {
  label: string;
  config: LayoutConfig;
}

export const DEFAULT_CONFIG: LayoutConfig = {
  direction: "vertical",
  justify: "start",
  align: "leading",
  spacing: 12,
  horizontalPadding: 16,
  verticalPadding: 16,
  width: "fill",
  height: "fit",
  fixedWidth: 320,
  fixedHeight: 240,
};

export const PRESETS: readonly PlaygroundPreset[] = [
  {
    label: "Column",
    config: DEFAULT_CONFIG,
  },
  {
    label: "Toolbar",
    config: {
      ...DEFAULT_CONFIG,
      direction: "horizontal",
      align: "center",
      justify: "spaceBetween",
      spacing: 8,
    },
  },
  {
    label: "Centered",
    config: {
      ...DEFAULT_CONFIG,
      justify: "center",
      align: "center",
      width: "fixed",
      height: "fixed",
    },
  },
  {
    label: "Stretch",
    config: {
      ...DEFAULT_CONFIG,
      align: "stretch",
      width: "fill",
    },
  },
];

const justifyContent: Record<Justify, CSSProperties["justifyContent"]> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  spaceBetween: "space-between",
  spaceAround: "space-around",
};

const alignItems: Record<Align, CSSProperties["alignItems"]> = {
  leading: "flex-start",
  center: "center",
  trailing: "flex-end",
  stretch: "stretch",
};

export function buildPreviewStyle(config: LayoutConfig): CSSProperties {
  return {
    alignItems: alignItems[config.align],
    boxSizing: "border-box",
    display: "flex",
    flexDirection: config.direction === "vertical" ? "column" : "row",
    gap: `${config.spacing}px`,
    height: resolveCssSize(config.height, config.fixedHeight),
    justifyContent: justifyContent[config.justify],
    maxHeight: "100%",
    maxWidth: "100%",
    padding: `${config.verticalPadding}px ${config.horizontalPadding}px`,
    width: resolveCssSize(config.width, config.fixedWidth),
  };
}

export function buildSwiftUICode(config: LayoutConfig): string {
  const stack = config.direction === "vertical" ? "VStack" : "HStack";
  const stackAlignment = resolveStackAlignment(config);
  const childLines = buildChildLines(config);
  const modifiers = [
    buildWidthModifier(config),
    buildHeightModifier(config),
    buildSpaceAroundModifier(config),
    `.padding(.horizontal, ${config.horizontalPadding})`,
    `.padding(.vertical, ${config.verticalPadding})`,
  ].filter((modifier: string | null): modifier is string => modifier !== null);

  return [
    `${stack}(alignment: ${stackAlignment}, spacing: ${config.spacing}) {`,
    ...childLines.map((line: string): string => `    ${line}`),
    "}",
    ...modifiers,
  ].join("\n");
}

export function buildNativeNotes(config: LayoutConfig): readonly string[] {
  const notes: string[] = [];
  const mainSize = config.direction === "vertical" ? config.height : config.width;

  if (mainSize === "fit" && config.justify !== "start") {
    notes.push("Justification needs extra main-axis space. Choose fill or fixed size to see it.");
  }

  if (config.justify === "spaceAround") {
    notes.push("SwiftUI has no exact native space-around; the code uses spacing plus half-spacing edge padding.");
  }

  if (config.align === "stretch") {
    notes.push("SwiftUI has no stack-level stretch case; each generated child receives a flexible cross-axis frame.");
  }

  return notes;
}

function resolveCssSize(mode: SizeMode, fixedValue: number): string {
  switch (mode) {
    case "fit":
      return "fit-content";
    case "fill":
      return "100%";
    case "fixed":
      return `${fixedValue}px`;
  }
}

function resolveStackAlignment(config: LayoutConfig): string {
  if (config.direction === "vertical") {
    switch (config.align) {
      case "leading":
      case "stretch":
        return ".leading";
      case "center":
        return ".center";
      case "trailing":
        return ".trailing";
    }
  }

  switch (config.align) {
    case "leading":
    case "stretch":
      return ".top";
    case "center":
      return ".center";
    case "trailing":
      return ".bottom";
  }
}

function buildChildLines(config: LayoutConfig): readonly string[] {
  const texts = ["First", "Second", "Third"] as const;
  const textLines = texts.map((text: string): string => buildTextLine(text, config));

  if (config.justify !== "spaceBetween") {
    return textLines;
  }

  return [textLines[0], "Spacer()", textLines[1], "Spacer()", textLines[2]].filter(
    (line: string | undefined): line is string => line !== undefined,
  );
}

function buildTextLine(text: string, config: LayoutConfig): string {
  if (config.align !== "stretch") {
    return `Text("${text}")`;
  }

  return config.direction === "vertical"
    ? `Text("${text}")\n        .frame(maxWidth: .infinity, alignment: .leading)`
    : `Text("${text}")\n        .frame(maxHeight: .infinity, alignment: .top)`;
}

function buildWidthModifier(config: LayoutConfig): string | null {
  const alignment = resolveWidthAlignment(config);

  switch (config.width) {
    case "fit":
      return null;
    case "fill":
      return `.frame(maxWidth: .infinity, alignment: ${alignment})`;
    case "fixed":
      return `.frame(width: ${config.fixedWidth}, alignment: ${alignment})`;
  }
}

function buildHeightModifier(config: LayoutConfig): string | null {
  const alignment = resolveHeightAlignment(config);

  switch (config.height) {
    case "fit":
      return null;
    case "fill":
      return `.frame(maxHeight: .infinity, alignment: ${alignment})`;
    case "fixed":
      return `.frame(height: ${config.fixedHeight}, alignment: ${alignment})`;
  }
}

function buildSpaceAroundModifier(config: LayoutConfig): string | null {
  if (config.justify !== "spaceAround") {
    return null;
  }

  const axis = config.direction === "vertical" ? "vertical" : "horizontal";
  return `.padding(.${axis}, ${config.spacing / 2})`;
}

function resolveWidthAlignment(config: LayoutConfig): string {
  if (config.direction === "horizontal") {
    return resolveHorizontalJustification(config.justify);
  }

  switch (config.align) {
    case "leading":
    case "stretch":
      return ".leading";
    case "center":
      return ".center";
    case "trailing":
      return ".trailing";
  }
}

function resolveHeightAlignment(config: LayoutConfig): string {
  if (config.direction === "vertical") {
    return resolveVerticalJustification(config.justify);
  }

  switch (config.align) {
    case "leading":
    case "stretch":
      return ".top";
    case "center":
      return ".center";
    case "trailing":
      return ".bottom";
  }
}

function resolveHorizontalJustification(justify: Justify): string {
  switch (justify) {
    case "start":
      return ".leading";
    case "center":
      return ".center";
    case "end":
      return ".trailing";
    case "spaceBetween":
    case "spaceAround":
      return ".center";
  }
}

function resolveVerticalJustification(justify: Justify): string {
  switch (justify) {
    case "start":
      return ".top";
    case "center":
      return ".center";
    case "end":
      return ".bottom";
    case "spaceBetween":
    case "spaceAround":
      return ".center";
  }
}
