import { describe, expect, test } from 'bun:test';

import { getPlayground } from '../src/playgrounds/registry.tsx';

describe('playground registry', (): void => {
  test('resolves registered playgrounds and rejects unknown slugs', (): void => {
    expect(getPlayground('stack-layout')?.title).toBe('VStack & HStack');
    expect(getPlayground('custom-font')?.guideSlug).toBe('custom-fonts');
    expect(getPlayground('unknown')).toBeUndefined();
  });
});
