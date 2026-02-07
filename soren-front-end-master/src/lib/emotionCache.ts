import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
import { prefixer } from 'stylis';

export const ltrCache = createCache({
  key: 'mui',
  prepend: true,
});

export const rtlCache = createCache({
  key: 'muirtl',
  prepend: true,
  stylisPlugins: [prefixer, rtlPlugin],
});
