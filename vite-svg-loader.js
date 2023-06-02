// CODE COPIED FROM https://github.com/jpkleemans/vite-svg-loader/blob/main/index.js
// Adapted to extract SVG Style tags and place them as scoped styles.

const fs = require('fs').promises;
const { createHash } = require('crypto');
const { compileTemplate, compileStyle } = require('@vue/compiler-sfc');
const { optimize: optimizeSvg } = require('svgo');

module.exports = function svgLoader(options = {}) {
  const {
    svgoConfig,
    svgo = true,
    defaultImport = 'component',
    scopedCSS = false,
  } = options;

  const componentRegex = /\.svg(\?(component|style)(&.*)?)?$/;
  const rawRegex = /\.svg\?raw$/;
  const urlRegex = /\.svg\?url$/;

  return {
    name: 'svg-loader',
    enforce: 'pre',

    resolveId(id) {
      if (id.match(urlRegex)) {
        return false;
      }
    },

    async load(id) {
      if (!(id.match(componentRegex) || id.match(rawRegex))) {
        return;
      }

      const query = parseURLRequest(id, defaultImport);

      let svg;
      try {
        svg = await fs.readFile(query.filename, 'utf-8');
      } catch (ex) {
        console.warn('\n', `${id} couldn't be loaded by vite-svg-loader, fallback to default loader`);
        return;
      }

      if (query.raw) {
        return `export default ${JSON.stringify(svg)}`;
      }

      return {
        code: svg,
      }
    },

    transform(code, id) {
      if (!id.match(componentRegex)) {
        return;
      }

      const query = parseURLRequest(id, defaultImport);

      if (svgo && !query.skipsvgo) {
        code = optimizeSvg(code, {
          ...svgoConfig,
          path: query.filename,
        }).data
      }

      let style;
      if (scopedCSS && !query.skipscopedcss) {
        [code, style] = extractStyles(code);
      }

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

        return {
          code: code.join('\n'),
          map: { mappings: '' },
        };
      }

      const hashedID = computeIdHash(JSON.stringify(id));
      const result = compileTemplate({
        id: hashedID,
        source: code,
        filename: query.filename,
        transformAssetUrls: false,
        scoped: scopedCSS && style,
      });

      code = [
        result.code,
        'export default {render: render}',
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

module.exports.default = module.exports
