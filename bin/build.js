import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { minify } from 'html-minifier-terser';

export const build = async () => {
  // Create destination directory.
  const mkdirPromise = mkdir('./dist', { recursive: true });
  // Build the output from the template with the JS built by rollup and CSS.
  const template = await readFile('./src/index.html', 'utf8');
  const script = await readFile('./build/index.js', 'utf8');
  const style = await readFile('./src/style.css', 'utf8');

  const output = template
    .replace(/<!--\s*{{\s*script\s*}}\s*-->/, `<script>${script}</script>`)
    .replace(/<!--\s*{{\s*style\s*}}\s*-->/, `<style>${style}</style>`);

  const minified = await minify(output, {
    /*
    collapseBooleanAttributes: true,
    collapseWhitespace: true,
    decodeEntities: true,
    maxLineLength: 120,
    minifyCSS: true,
    minifyJS: true,
    removeAttributeQuotes: true,
    removeComments: true,
    removeEmptyAttributes: true,
    removeOptionalTags: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    useShortDoctype: true,
    */
  });

  await mkdirPromise;
  await writeFile('./dist/index.html', minified);
};

build();
