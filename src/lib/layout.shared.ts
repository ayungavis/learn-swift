import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: 'Learn SwiftUI',
    },
    links: [
      {
        text: 'Playgrounds',
        url: '/#playgrounds',
      },
    ],
  };
}
