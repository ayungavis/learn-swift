import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: 'SwiftUI Layout Lab',
    },
    links: [
      {
        text: 'Playgrounds',
        url: '/#playgrounds',
      },
    ],
  };
}
