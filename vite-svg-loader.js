// CODE COPIED FROM https://github.com/jpkleemans/vite-svg-loader/blob/main/index.js
// Adapted to extract SVG Style tags and place them as scoped styles.

import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'crypto';
import { compileTemplate, compileStyle } from '@vue/compiler-sfc';
import { optimize as optimizeSvg } from 'svgo';
import pjson from './package.json';
import findCacheDir from 'find-cache-dir';

const BENCHMARK = false;

export default function svgLoader(options = {}) {
  const {
    svgo = true,
    svgoConfig,
    svgoCache = false,
    defaultImport = 'component',
    scopedCSS = false,
  } = options;

  const componentRegex = /\.svg(\?(component|style)(&.*)?)?$/;
  const rawRegex = /\.svg\?raw$/;
  const urlRegex = /\.svg\?url$/;
  const cacheThunk = (svgo && svgoCache) ? findCacheDir({name: `vite-svg-loader-${pjson.version}`, create: true, thunk: true}) : null;

  return {
    name: 'svg-loader',
    enforce: 'pre',

    resolveId(id) {
      if (id.match(urlRegex)) {
        return null;
      }
    },

    async load(id) {
      const benchmark = new BenchmarkTimer(id);

      if (!(id.match(componentRegex) || id.match(rawRegex))) {
        return;
      }

      const query = parseURLRequest(id, defaultImport);
      const hashedID = computeIdHash(JSON.stringify(query.filename));
      let svg;

      if (svgo && svgoCache && !query.skipsvgo) {
        const cachedFile = cacheThunk(`${hashedID}.svg`);

        try {
          if (fs.existsSync(cachedFile) && fs.statSync(cachedFile).mtime > fs.statSync(query.filename).mtime) {
            svg = await fsp.readFile(cachedFile, 'utf-8');
            benchmark.step('loading cache');
          }
        }
        catch (ex) {
          console.warn(`[vite-svg-loader] Something went wrong trying to read the cache, rebuilding ${id}`);
          svg = null;
        }
      }

      if (!svg) {
        try {
          svg = await fsp.readFile(query.filename, 'utf-8');
        }
        catch (ex) {
          console.warn('\n', `[vite-svg-loader] ${id} couldn't be loaded, fallback to default loader`);
          return;
        }

        benchmark.step('loading file');

        if (svgo && !query.skipsvgo) {
          svg = optimizeSvg(svg, {
            ...svgoConfig,
            path: query.filename,
          }).data

          benchmark.step('optimizing svg');

          if (svgoCache) {
            const cachedFile = cacheThunk(`${hashedID}.svg`);
            try {
              await fsp.writeFile(cachedFile, svg);
            }
            catch (ex) {
              console.warn(`[vite-svg-loader] Could not cache transformed file ${id}`);
            }

            benchmark.step('storing cache');
          }
        }
      }

      if (query.raw) {
        return `export default ${JSON.stringify(svg)}`;
      }

      return {
        code: svg,
      }
    },

    transform(code, id) {
      const benchmark = new BenchmarkTimer(id);
      
      if (!id.match(componentRegex)) {
        return;
      }

      const query = parseURLRequest(id, defaultImport);

      let style;
      if (scopedCSS && !query.skipscopedcss) {
        [code, style] = extractStyles(code);
      }

      benchmark.step('extracting styles');

      if (query.style) {
        if (!query.id) {
          this.error(`vite-svg-loader did not get a valid hash for the scoped style of ${id}`);
          return;
        }

        const result = compileStyle({
          id: query.id,
          source: style,
          filename: query.filename,
          scoped: true,
        });

        code = [
          'const sheet = new CSSStyleSheet();',
          `sheet.replaceSync(${JSON.stringify(result.code)});`,
          'document.adoptedStyleSheets.push(sheet);',
          'export default sheet;',
        ]

        benchmark.step('compiling styles');

        return {
          code: code.join('\n'),
          map: { mappings: '' },
        };
      }

      const hashedID = computeIdHash(JSON.stringify(id));
      const scopeID = `data-v-${hashedID}`;
      const result = compileTemplate({
        id: hashedID,
        source: code,
        filename: query.filename,
        transformAssetUrls: false,
        scoped: scopedCSS && style,
        compilerOptions: {
          scopedID: scopeID,
        },
      });

      code = [
        result.code,
        `export default {render: render, __scopeId: "${scopeID}", __name: "${path.parse(query.filename).name}", __file: "${query.filename}"}`,
      ];

      if (scopedCSS && style) {
        const extraQueries = [];
        if (query.skipsvgo) {
          extraQueries.push('&skipsvgo');
        }
        if (query.skipscopedcss) {
          extraQueries.push('&skipscopedcss');
        }

        code = [
          `import '${query.filename}?style&id=${hashedID}${extraQueries.join("")}'`,
          ...code,
        ];
      }

      benchmark.step('compiling template');

      return {
        code: code.join('\n'),
        map: { mappings: '' },
      };
    },
  }
}

function extractStyles(svg) {
  const styleRE = /<style[^>]*>([\s\S]*?)<\/style>/ig;
  let styles = [];
  let match;

  while (match = styleRE.exec(svg)) {
    const style = match[1];
    styles.push(style);

    const from = match.index;
    const to = from + match[0].length;
    svg = svg.slice(0, from) + svg.slice(to);
    styleRE.lastIndex -= match[0].length;
  }
  styles = styles.join('\n').replaceAll('&quot;', '"').replaceAll('&apos;', "'");

  return [svg, styles];
}

function computeIdHash(id) {
  return createHash('sha256').update(id).digest('hex').substring(0, 8);
}

function parseURLRequest(id, defaultImport) {
  const [filename, rawQuery] = id.split('?', 2);
  let query;

  if (!rawQuery) {
    query = { [defaultImport]: true };
  } else {
    query = Object.fromEntries(new URLSearchParams(rawQuery));

    if (query.component != null) {
      query.component = true;
    } else if (query.style != null) {
      query.style = true;
    } else if (query.raw != null) {
      query.raw = true;
    } else if (query.url != null) {
      query.url = true;
    } else {
      query[defaultImport] = true;
    }

    if (query.skipsvgo != null) {
      query.skipsvgo = true;
    }
    if (query.skipscopedcss != null) {
      query.skipscopedcss = true;
    }
  }

  return {
    filename,
    ...query,
  };
}

class BenchmarkTimer {
  constructor(name) {
    this.name = name;
    this.t0 = performance.now();
  }

  step(...args) {
    if (!BENCHMARK) { return; }
    const time = (performance.now() - this.t0) / 1000;
    console.debug(`[${this.name}] ${time.toFixed(3)}s`, ...args);
    this.t0 = performance.now();
  }
}
