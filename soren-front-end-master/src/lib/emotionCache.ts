import createCache from '@emotion/cache';
import type { StylisPlugin } from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
import { prefixer } from 'stylis';

const rtlStylisPlugins: StylisPlugin[] = [
  prefixer as unknown as StylisPlugin,
  rtlPlugin as unknown as StylisPlugin,
];

export const ltrCache = createCache({
  key: 'mui',
  prepend: true,
});

export const rtlCache = createCache({
  key: 'muirtl',
  prepend: true,
  stylisPlugins: rtlStylisPlugins,
});
