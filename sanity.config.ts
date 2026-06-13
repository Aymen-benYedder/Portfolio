import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './sanity/schemas';
import { deskStructure } from './sanity/structure/deskStructure';

const previewUrl = (typeof document !== 'undefined' && document.location?.origin)
  ? `${document.location.origin}/api/preview`
  : 'https://aymen.benyedder.top/api/preview';

export default defineConfig({
  name: 'default',
  title: 'AYMEN.DEV',
  projectId: 'kv8mx0wv',
  dataset: 'production',
  apiVersion: '2026-03-01',
  basePath: '/admin',
  plugins: [
    structureTool({ structure: deskStructure }),
  ],
  schema: {
    types: schemaTypes,
  },
  document: {
    productionUrl: async (prev, ctx) => {
      const { document } = ctx as any;
      if (document?._type === 'post' && document?.slug?.current) {
        return `https://aymen.benyedder.top/blog/${document.slug.current}/`;
      }
      if (document?._type === 'servicePage' && document?.slug?.current) {
        return `https://aymen.benyedder.top/services/${document.slug.current}/`;
      }
      return prev;
    },
  },
});
