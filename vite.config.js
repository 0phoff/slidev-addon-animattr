import { defineConfig } from 'vite'
import svgLoader from './vite-svg-loader'

export default defineConfig({
  plugins: [
    svgLoader({
      scopedCSS: true,
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
})
