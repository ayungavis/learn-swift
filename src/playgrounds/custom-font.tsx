import { useState } from 'react';
import type { ChangeEvent, CSSProperties } from 'react';

type CopyStatus = 'idle' | 'copied' | 'failed';
type FontTextStyle = 'largeTitle' | 'title2' | 'body' | 'caption';
type PreviewSize = 'large' | 'extraExtraExtraLarge' | 'accessibilityExtraExtraExtraLarge';

interface FontPlaygroundConfig {
  postScriptName: string;
  textStyle: FontTextStyle;
  baseSize: number;
  previewSize: PreviewSize;
  sample: string;
}

interface TypographyPreset {
  value: FontTextStyle;
  label: string;
  token: string;
  size: number;
}

const TYPOGRAPHY_PRESETS: readonly TypographyPreset[] = [
  { value: 'largeTitle', label: 'Large title', token: 'largeTitle', size: 34 },
  { value: 'title2', label: 'Title', token: 'title', size: 22 },
  { value: 'body', label: 'Body', token: 'body', size: 17 },
  { value: 'caption', label: 'Caption', token: 'caption', size: 12 },
];

const PREVIEW_SCALES: Readonly<Record<PreviewSize, number>> = {
  large: 1,
  extraExtraExtraLarge: 1.35,
  accessibilityExtraExtraExtraLarge: 2,
};

const DEFAULT_CONFIG: FontPlaygroundConfig = {
  postScriptName: 'BrandSans-Regular',
  textStyle: 'body',
  baseSize: 17,
  previewSize: 'large',
  sample: 'Readable at every size',
};

export function buildCustomFontCode(config: FontPlaygroundConfig): string {
  const preset = getTypographyPreset(config.textStyle);

  return `import SwiftUI

enum AppTypography {
    static let ${preset.token}: Font = .custom(
        ${toSwiftString(config.postScriptName)},
        size: ${config.baseSize},
        relativeTo: .${config.textStyle}
    )
}

struct CustomFontExample: View {
    var body: some View {
        Text(${toSwiftString(config.sample)})
            .font(AppTypography.${preset.token})
    }
}`;
}

export function CustomFontPlayground(): React.JSX.Element {
  const [config, setConfig] = useState<FontPlaygroundConfig>({ ...DEFAULT_CONFIG });
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle');
  const code = buildCustomFontCode(config);
  const previewStyle: CSSProperties = {
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    fontSize: `${config.baseSize * PREVIEW_SCALES[config.previewSize]}px`,
  };

  const updateConfig = (nextConfig: FontPlaygroundConfig): void => {
    setCopyStatus('idle');
    setConfig(nextConfig);
  };

  const copyCode = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(code);
      setCopyStatus('copied');
    } catch (error: unknown) {
      console.error('Unable to copy generated SwiftUI font code.', { error });
      setCopyStatus('failed');
    }
  };

  return (
    <div className="stack-playground font-playground">
      <div className="playground-toolbar">
        <strong>Dynamic Type playground</strong>
        <span className="simulation-badge">Approximate browser scale → SwiftUI code</span>
      </div>

      <div className="playground-grid">
        <form className="controls" onSubmit={(event): void => event.preventDefault()}>
          <h2>Typography controls</h2>

          <label>
            PostScript name
            <input
              type="text"
              value={config.postScriptName}
              onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                updateConfig({ ...config, postScriptName: event.currentTarget.value })
              }
            />
          </label>

          <label>
            Semantic style
            <select
              value={config.textStyle}
              onChange={(event: ChangeEvent<HTMLSelectElement>): void => {
                const textStyle = parseTextStyle(event.currentTarget.value);
                const preset = getTypographyPreset(textStyle);
                updateConfig({ ...config, textStyle, baseSize: preset.size });
              }}
            >
              {TYPOGRAPHY_PRESETS.map((preset: TypographyPreset) => (
                <option key={preset.value} value={preset.value}>{preset.label}</option>
              ))}
            </select>
          </label>

          <label className="range-control">
            <span>Base size <output>{config.baseSize} pt</output></span>
            <input
              type="range"
              min="10"
              max="54"
              step="1"
              value={config.baseSize}
              onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                updateConfig({ ...config, baseSize: parseNumber(event.currentTarget.value) })
              }
            />
          </label>

          <label>
            Preview content size
            <select
              value={config.previewSize}
              onChange={(event: ChangeEvent<HTMLSelectElement>): void =>
                updateConfig({ ...config, previewSize: parsePreviewSize(event.currentTarget.value) })
              }
            >
              <option value="large">Default · Large</option>
              <option value="extraExtraExtraLarge">Extra extra extra large</option>
              <option value="accessibilityExtraExtraExtraLarge">Accessibility XXXL</option>
            </select>
          </label>

          <label>
            Sample text
            <textarea
              rows={4}
              value={config.sample}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>): void =>
                updateConfig({ ...config, sample: event.currentTarget.value })
              }
            />
          </label>
        </form>

        <section className="preview-panel" aria-label="Typography preview">
          <div className="panel-heading">
            <div>
              <span>Live preview</span>
              <strong>{getTypographyPreset(config.textStyle).label}</strong>
            </div>
            <span>{config.baseSize} pt base</span>
          </div>
          <div className="preview-stage">
            <article className="font-preview-card">
              <span>Approximate scale preview</span>
              <p style={previewStyle}>{config.sample}</p>
              <code>{config.postScriptName}</code>
            </article>
          </div>
          <p className="font-preview-note">
            The website previews scale with a system font. Xcode renders the real bundled font.
          </p>
        </section>

        <section className="code-panel" aria-label="Generated SwiftUI code">
          <div className="panel-heading">
            <div>
              <span>Native output</span>
              <strong>SwiftUI</strong>
            </div>
            <button type="button" onClick={(): void => void copyCode()}>
              {copyStatus === 'copied' ? 'Copied' : 'Copy code'}
            </button>
          </div>
          <pre><code>{code}</code></pre>
          <p className="copy-status" aria-live="polite">
            {copyStatus === 'failed' ? 'Copy failed. Check browser clipboard permission.' : ''}
          </p>
        </section>
      </div>
    </div>
  );
}

function getTypographyPreset(textStyle: FontTextStyle): TypographyPreset {
  const preset = TYPOGRAPHY_PRESETS.find((candidate) => candidate.value === textStyle);
  if (preset === undefined) throw new Error(`Unknown SwiftUI text style: ${textStyle}.`);
  return preset;
}

function parseTextStyle(value: string): FontTextStyle {
  if (value === 'largeTitle' || value === 'title2' || value === 'body' || value === 'caption') {
    return value;
  }
  throw new Error(`Unknown SwiftUI text style: ${value}.`);
}

function parsePreviewSize(value: string): PreviewSize {
  if (
    value === 'large' ||
    value === 'extraExtraExtraLarge' ||
    value === 'accessibilityExtraExtraExtraLarge'
  ) {
    return value;
  }
  throw new Error(`Unknown Dynamic Type preview size: ${value}.`);
}

function parseNumber(value: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`Invalid font size: ${value}.`);
  return parsed;
}

function toSwiftString(value: string): string {
  const serialized = JSON.stringify(value);
  if (serialized === undefined) throw new Error('Unable to serialize text as a Swift string.');
  return serialized;
}
