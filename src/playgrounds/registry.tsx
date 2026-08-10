import type { ComponentType } from 'react';

import { StackLayoutPlayground } from './stack-layout';

export interface PlaygroundDefinition {
  slug: string;
  title: string;
  description: string;
  component: ComponentType;
}

export const PLAYGROUNDS: readonly PlaygroundDefinition[] = [
  {
    slug: 'stack-layout',
    title: 'VStack & HStack',
    description: 'Translate direction, alignment, spacing, padding, and sizing into native SwiftUI.',
    component: StackLayoutPlayground,
  },
];

export function getPlayground(slug: string): PlaygroundDefinition | undefined {
  return PLAYGROUNDS.find((playground) => playground.slug === slug);
}
