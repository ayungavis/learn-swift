import { describe, expect, test } from "bun:test";

import { buildNativeNotes, buildSwiftUICode, DEFAULT_CONFIG } from "../src/layout.ts";
import { buildCustomFontCode } from "../src/playgrounds/custom-font.tsx";

describe("SwiftUI code generator", (): void => {
  test("maps native stack behavior and explains unsupported CSS semantics", (): void => {
    const defaultCode = buildSwiftUICode(DEFAULT_CONFIG);
    const spacedCode = buildSwiftUICode({
      ...DEFAULT_CONFIG,
      direction: "horizontal",
      justify: "spaceBetween",
    });
    const notes = buildNativeNotes({
      ...DEFAULT_CONFIG,
      justify: "spaceAround",
    });

    expect(defaultCode).toContain("VStack(alignment: .leading, spacing: 12)");
    expect(defaultCode).toContain(".frame(maxWidth: .infinity, alignment: .leading)");
    expect(spacedCode).toContain("HStack(alignment: .top, spacing: 12)");
    expect(spacedCode.match(/Spacer\(\)/g)).toHaveLength(2);
    expect(notes.some((note: string): boolean => note.includes("no exact native space-around"))).toBeTrue();
  });
});

describe("custom font code generator", (): void => {
  test("uses the PostScript name and Dynamic Type text style", (): void => {
    const code = buildCustomFontCode({
      postScriptName: "BrandSans-Semibold",
      textStyle: "title2",
      baseSize: 24,
      previewSize: "large",
      sample: "Hello \"SwiftUI\"",
    });

    expect(code).toContain('static let title: Font = .custom(');
    expect(code).toContain('"BrandSans-Semibold"');
    expect(code).toContain('relativeTo: .title2');
    expect(code).toContain('Text("Hello \\"SwiftUI\\"")');
  });
});
