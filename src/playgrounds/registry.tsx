import type { ComponentType } from 'react';

import { CustomFontPlayground } from './custom-font';
import { StackLayoutPlayground } from './stack-layout';
import { StateOwnershipPlayground } from './state-ownership';

export interface PlaygroundDefinition {
  slug: string;
  title: string;
  description: string;
  guideSlug: string;
  component: ComponentType;
}

export const PLAYGROUNDS: readonly PlaygroundDefinition[] = [
  {
    slug: 'state-ownership',
    title: 'State ownership',
    description: 'Choose who owns a value and generate the smallest correct SwiftUI state contract.',
    guideSlug: 'state-and-data-flow',
    component: StateOwnershipPlayground,
  },
  {
    slug: 'stack-layout',
    title: 'VStack & HStack',
    description: 'Translate direction, alignment, spacing, padding, and sizing into native SwiftUI.',
    guideSlug: 'native-stacks',
    component: StackLayoutPlayground,
  },
  {
    slug: 'custom-font',
    title: 'Custom fonts',
    description: 'Generate semantic SwiftUI typography tokens that preserve Dynamic Type.',
    guideSlug: 'custom-fonts',
    component: CustomFontPlayground,
  },
];

export function getPlayground(slug: string): PlaygroundDefinition | undefined {
  return PLAYGROUNDS.find((playground) => playground.slug === slug);
}
