import { defineConfig, UserConfig } from 'vite'
import svgLoader from './vite-svg-loader.js'

export default defineConfig({
  plugins: [
    svgLoader({
      scopedCSS: true,
      svgoCache: true,
      svgoConfig: {
        plugins: [
          {
            name: 'preset-default',
            params: {
              overrides: {
                cleanupIds: false,
                convertShapeToPath: false,
                inlineStyles: false,
                mergePaths: false,
                removeHiddenElems: false,
                removeViewBox: false,
              },
            },
          },
          'removeDimensions',
          'removeXMLNS',
        ],
      }
    }),
  ],
  slidev: {
    components: {
      extensions: ['vue', 'md', 'js', 'ts', 'jsx', 'tsx', 'svg'],
    },
  },
} as UserConfig);
