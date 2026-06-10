import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'static',
  adapter: cloudflare({
    workerName: 'championship-bracket',
    kvNamespaces: [
      { binding: 'SESSION', id: '1157f6e682a74df1a26184458b44bd8a' }
    ]
  })
});
