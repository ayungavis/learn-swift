import { useState } from 'react';
import type { ChangeEvent } from 'react';

import {
  buildNativeNotes,
  buildPreviewStyle,
  buildSwiftUICode,
  DEFAULT_CONFIG,
  PRESETS,
} from '@/layout';
import type { Align, Direction, Justify, LayoutConfig, SizeMode } from '@/layout';

type CopyStatus = 'idle' | 'copied' | 'failed';

export function StackLayoutPlayground(): React.JSX.Element {
  const [config, setConfig] = useState<LayoutConfig>({ ...DEFAULT_CONFIG });
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle');
  const code = buildSwiftUICode(config);
  const notes = buildNativeNotes(config);

  const updateConfig = (nextConfig: LayoutConfig): void => {
    setCopyStatus('idle');
    setConfig(nextConfig);
  };

  const copyCode = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(code);
      setCopyStatus('copied');
    } catch (error: unknown) {
      console.error('Unable to copy generated SwiftUI code.', { error });
      setCopyStatus('failed');
    }
  };

  return (
    <div className="stack-playground">
      <div className="playground-toolbar">
        <div className="preset-list" aria-label="Layout presets">
          {PRESETS.map((preset) => (
            <button
              type="button"
              key={preset.label}
              onClick={(): void => updateConfig({ ...preset.config })}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <span className="simulation-badge">CSS simulation → SwiftUI code</span>
      </div>

      <div className="playground-grid">
        <form className="controls" onSubmit={(event): void => event.preventDefault()}>
          <h2>Layout controls</h2>

          <label>
            Direction
            <select
              value={config.direction}
              onChange={(event: ChangeEvent<HTMLSelectElement>): void =>
                updateConfig({ ...config, direction: parseDirection(event.currentTarget.value) })
              }
            >
              <option value="vertical">Vertical · VStack</option>
              <option value="horizontal">Horizontal · HStack</option>
            </select>
          </label>

          <label>
            Align children
            <select
              value={config.align}
              onChange={(event: ChangeEvent<HTMLSelectElement>): void =>
                updateConfig({ ...config, align: parseAlign(event.currentTarget.value) })
              }
            >
              <option value="leading">Leading</option>
              <option value="center">Center</option>
              <option value="trailing">Trailing</option>
              <option value="stretch">Stretch</option>
            </select>
          </label>

          <label>
            Justify content
            <select
              value={config.justify}
              onChange={(event: ChangeEvent<HTMLSelectElement>): void =>
                updateConfig({ ...config, justify: parseJustify(event.currentTarget.value) })
              }
            >
              <option value="start">Start</option>
              <option value="center">Center</option>
              <option value="end">End</option>
              <option value="spaceBetween">Space between</option>
              <option value="spaceAround">Space around</option>
            </select>
          </label>

          <RangeControl
            label="Spacing"
            value={config.spacing}
            max={40}
            onChange={(value: number): void => updateConfig({ ...config, spacing: value })}
          />

          <RangeControl
            label="Horizontal padding"
            value={config.horizontalPadding}
            max={48}
            onChange={(value: number): void =>
              updateConfig({ ...config, horizontalPadding: value })
            }
          />

          <RangeControl
            label="Vertical padding"
            value={config.verticalPadding}
            max={48}
            onChange={(value: number): void =>
              updateConfig({ ...config, verticalPadding: value })
            }
          />

          <SizeControl
            axis="Width"
            mode={config.width}
            fixedValue={config.fixedWidth}
            onModeChange={(value: SizeMode): void => updateConfig({ ...config, width: value })}
            onFixedValueChange={(value: number): void =>
              updateConfig({ ...config, fixedWidth: value })
            }
          />

          <SizeControl
            axis="Height"
            mode={config.height}
            fixedValue={config.fixedHeight}
            onModeChange={(value: SizeMode): void => updateConfig({ ...config, height: value })}
            onFixedValueChange={(value: number): void =>
              updateConfig({ ...config, fixedHeight: value })
            }
          />
        </form>

        <section className="preview-panel" aria-label="Layout preview">
          <PanelHeading
            label="Live preview"
            title={config.direction === 'vertical' ? 'VStack' : 'HStack'}
            detail={`${config.width} × ${config.height}`}
          />
          <div className="preview-stage">
            <div className="preview-stack" style={buildPreviewStyle(config)}>
              <div className="preview-item preview-item-one">First</div>
              <div className="preview-item preview-item-two">Second</div>
              <div className="preview-item preview-item-three">Third</div>
            </div>
          </div>
          {notes.length > 0 && (
            <ul className="native-notes">
              {notes.map((note: string) => <li key={note}>{note}</li>)}
            </ul>
          )}
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

function PanelHeading({
  label,
  title,
  detail,
}: {
  label: string;
  title: string;
  detail: string;
}): React.JSX.Element {
  return (
    <div className="panel-heading">
      <div>
        <span>{label}</span>
        <strong>{title}</strong>
      </div>
      <span>{detail}</span>
    </div>
  );
}

function RangeControl({
  label,
  value,
  max,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  onChange: (value: number) => void;
}): React.JSX.Element {
  return (
    <label className="range-control">
      <span>{label}<output>{value}</output></span>
      <input
        type="range"
        min="0"
        max={max}
        step="2"
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>): void =>
          onChange(parseNumber(event.currentTarget.value, label))
        }
      />
    </label>
  );
}

function SizeControl({
  axis,
  mode,
  fixedValue,
  onModeChange,
  onFixedValueChange,
}: {
  axis: 'Width' | 'Height';
  mode: SizeMode;
  fixedValue: number;
  onModeChange: (value: SizeMode) => void;
  onFixedValueChange: (value: number) => void;
}): React.JSX.Element {
  return (
    <fieldset className="size-control">
      <legend>{axis}</legend>
      <div className="size-row">
        <select
          aria-label={`${axis} mode`}
          value={mode}
          onChange={(event: ChangeEvent<HTMLSelectElement>): void =>
            onModeChange(parseSizeMode(event.currentTarget.value))
          }
        >
          <option value="fit">Fit</option>
          <option value="fill">Fill</option>
          <option value="fixed">Fixed</option>
        </select>
        {mode === 'fixed' && (
          <input
            aria-label={`Fixed ${axis.toLowerCase()}`}
            type="number"
            min="80"
            max="480"
            step="8"
            value={fixedValue}
            onChange={(event: ChangeEvent<HTMLInputElement>): void =>
              onFixedValueChange(parseNumber(event.currentTarget.value, axis))
            }
          />
        )}
      </div>
    </fieldset>
  );
}

function parseDirection(value: string): Direction {
  if (value === 'vertical' || value === 'horizontal') return value;
  throw new Error(`Unknown stack direction: ${value}.`);
}

function parseAlign(value: string): Align {
  if (value === 'leading' || value === 'center' || value === 'trailing' || value === 'stretch') {
    return value;
  }
  throw new Error(`Unknown stack alignment: ${value}.`);
}

function parseJustify(value: string): Justify {
  if (
    value === 'start' ||
    value === 'center' ||
    value === 'end' ||
    value === 'spaceBetween' ||
    value === 'spaceAround'
  ) {
    return value;
  }
  throw new Error(`Unknown stack justification: ${value}.`);
}

function parseSizeMode(value: string): SizeMode {
  if (value === 'fit' || value === 'fill' || value === 'fixed') return value;
  throw new Error(`Unknown size mode: ${value}.`);
}

function parseNumber(value: string, field: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`Invalid ${field} value: ${value}.`);
  return parsed;
}
