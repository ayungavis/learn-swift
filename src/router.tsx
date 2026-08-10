import { createRouter as createTanStackRouter } from '@tanstack/react-router';

import { NotFound } from '@/components/not-found';
import { routeTree } from './routeTree.gen';

export function getRouter(): ReturnType<typeof createTanStackRouter> {
  return createTanStackRouter({
    routeTree,
    defaultPreload: 'intent',
    scrollRestoration: true,
    defaultNotFoundComponent: NotFound,
  });
}
