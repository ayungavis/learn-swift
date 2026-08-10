import { useState } from 'react';
import type { ChangeEvent } from 'react';

type CopyStatus = 'idle' | 'copied' | 'failed';
type StateScenario =
  | 'local'
  | 'parent-read'
  | 'parent-write'
  | 'model-read'
  | 'model-write'
  | 'environment';

interface StateExample {
  id: StateScenario;
  label: string;
  reactAnalogy: string;
  owner: string;
  contract: string;
  explanation: string;
  code: string;
}

const STATE_EXAMPLES: readonly StateExample[] = [
  {
    id: 'local',
    label: 'Local state',
    reactAnalogy: 'useState inside a component',
    owner: 'This view',
    contract: '@State private',
    explanation: 'The view creates and owns a simple value that must survive view updates.',
    code: `import SwiftUI

struct NotificationToggle: View {
    @State private var isEnabled = false

    var body: some View {
        Toggle("Notifications", isOn: $isEnabled)
    }
}`,
  },
  {
    id: 'parent-read',
    label: 'Read-only input',
    reactAnalogy: 'A read-only prop',
    owner: 'Parent view',
    contract: 'let',
    explanation: 'The child displays the current value but has no reason to mutate it.',
    code: `import SwiftUI

struct SettingsSummary: View {
    let isEnabled: Bool

    var body: some View {
        Text(isEnabled ? "Notifications on" : "Notifications off")
    }
}`,
  },
  {
    id: 'parent-write',
    label: 'Parent-owned binding',
    reactAnalogy: 'A controlled prop plus setter',
    owner: 'Parent view',
    contract: '@Binding',
    explanation: 'The child receives write access while the parent remains the source of truth.',
    code: `import SwiftUI

struct SettingsView: View {
    @State private var isEnabled = false

    var body: some View {
        NotificationEditor(isEnabled: $isEnabled)
    }
}

struct NotificationEditor: View {
    @Binding var isEnabled: Bool

    var body: some View {
        Toggle("Notifications", isOn: $isEnabled)
    }
}`,
  },
  {
    id: 'model-read',
    label: 'Read observable model',
    reactAnalogy: 'Reading an observable store',
    owner: 'Another view',
    contract: 'let model',
    explanation: 'Observation tracks properties read in body; no binding wrapper is needed for read-only access.',
    code: `import Observation
import SwiftUI

@MainActor
@Observable
final class SettingsModel {
    var isEnabled = false
}

struct SettingsSummary: View {
    let model: SettingsModel

    var body: some View {
        Text(model.isEnabled ? "Notifications on" : "Notifications off")
    }
}`,
  },
  {
    id: 'model-write',
    label: 'Edit observable model',
    reactAnalogy: 'A store-backed controlled input',
    owner: 'Parent view',
    contract: '@Bindable',
    explanation: 'The receiving view needs bindings to properties on an injected @Observable model.',
    code: `import Observation
import SwiftUI

@MainActor
@Observable
final class SettingsModel {
    var isEnabled = false
}

struct SettingsView: View {
    @State private var model = SettingsModel()

    var body: some View {
        NotificationEditor(model: model)
    }
}

struct NotificationEditor: View {
    @Bindable var model: SettingsModel

    var body: some View {
        Toggle("Notifications", isOn: $model.isEnabled)
    }
}`,
  },
  {
    id: 'environment',
    label: 'Shared environment model',
    reactAnalogy: 'Context for genuinely shared state',
    owner: 'App composition root',
    contract: '@Environment',
    explanation: 'A broad subtree shares one model; the editing view creates a local bindable projection.',
    code: `import Observation
import SwiftUI

@MainActor
@Observable
final class SettingsModel {
    var isEnabled = false
}

@main
struct ExampleApp: App {
    @State private var settings = SettingsModel()

    var body: some Scene {
        WindowGroup {
            SettingsView()
                .environment(settings)
        }
    }
}

struct SettingsView: View {
    @Environment(SettingsModel.self) private var settings

    var body: some View {
        @Bindable var settings = settings
        Toggle("Notifications", isOn: $settings.isEnabled)
    }
}`,
  },
];

export function getStateExample(scenario: StateScenario): StateExample {
  const example = STATE_EXAMPLES.find((candidate) => candidate.id === scenario);
  if (example === undefined) throw new Error(`Unknown SwiftUI state scenario: ${scenario}.`);
  return example;
}

export function StateOwnershipPlayground(): React.JSX.Element {
  const [scenario, setScenario] = useState<StateScenario>('local');
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle');
  const example = getStateExample(scenario);

  const selectScenario = (nextScenario: StateScenario): void => {
    setCopyStatus('idle');
    setScenario(nextScenario);
  };

  const copyCode = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(example.code);
      setCopyStatus('copied');
    } catch (error: unknown) {
      console.error('Unable to copy generated SwiftUI state code.', { error });
      setCopyStatus('failed');
    }
  };

  return (
    <div className="stack-playground state-playground">
      <div className="playground-toolbar">
        <div className="preset-list" aria-label="State relationship presets">
          {STATE_EXAMPLES.map((candidate) => (
            <button
              type="button"
              key={candidate.id}
              onClick={(): void => selectScenario(candidate.id)}
            >
              {candidate.label}
            </button>
          ))}
        </div>
        <span className="simulation-badge">Ownership decision → SwiftUI code</span>
      </div>

      <div className="playground-grid">
        <form className="controls" onSubmit={(event): void => event.preventDefault()}>
          <h2>State relationship</h2>

          <label>
            Scenario
            <select
              value={scenario}
              onChange={(event: ChangeEvent<HTMLSelectElement>): void =>
                selectScenario(parseStateScenario(event.currentTarget.value))
              }
            >
              {STATE_EXAMPLES.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>{candidate.label}</option>
              ))}
            </select>
          </label>

          <dl className="state-detail-list">
            <div>
              <dt>React analogy</dt>
              <dd>{example.reactAnalogy}</dd>
            </div>
            <div>
              <dt>Source of truth</dt>
              <dd>{example.owner}</dd>
            </div>
            <div>
              <dt>SwiftUI contract</dt>
              <dd><code>{example.contract}</code></dd>
            </div>
          </dl>
        </form>

        <section className="preview-panel" aria-label="State ownership preview">
          <div className="panel-heading">
            <div>
              <span>Ownership model</span>
              <strong>{example.label}</strong>
            </div>
            <span>iOS 17+</span>
          </div>
          <div className="preview-stage">
            <div className="state-preview">
              <div className="state-flow">
                <div className="state-node">
                  <span>Source of truth</span>
                  <strong>{example.owner}</strong>
                </div>
                <span className="state-arrow" aria-hidden="true">→</span>
                <div className="state-node state-node-accent">
                  <span>View contract</span>
                  <strong>{example.contract}</strong>
                </div>
              </div>
              <p>{example.explanation}</p>
            </div>
          </div>
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
          <pre><code>{example.code}</code></pre>
          <p className="copy-status" aria-live="polite">
            {copyStatus === 'failed' ? 'Copy failed. Check browser clipboard permission.' : ''}
          </p>
        </section>
      </div>
    </div>
  );
}

function parseStateScenario(value: string): StateScenario {
  if (
    value === 'local' ||
    value === 'parent-read' ||
    value === 'parent-write' ||
    value === 'model-read' ||
    value === 'model-write' ||
    value === 'environment'
  ) {
    return value;
  }
  throw new Error(`Unknown SwiftUI state scenario: ${value}.`);
}
