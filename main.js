import Vibrant from 'node-vibrant';
import colorthief from 'colorthief';
import path from 'node:path';
import splashy from 'splashy';
import tinycolor from 'tinycolor2';
import { promises as fs } from 'node:fs';
import { absolute, read, write, gitRoot } from 'firost'
import { _, pMap } from 'golgoth';

const testImages = ['image-1.jpg', 'image-2.jpg', 'image-3.png', 'image-4.png']

function getPaletteLink(palette) {
  return `https://coolors.co/${palette.join('-')}`;
}

async function getPaletteWithNodeVibrant(filepath) {
  const vibrantPalette = await Vibrant.from(filepath).getPalette();
  return _.chain(vibrantPalette)
    .map()
    .sortBy('_population')
    .reverse()
    .map((value) => {
      const [r, g, b] = value._rgb;
      return tinycolor({ r, g, b }).toHex();
    })
    .value();
}

async function getPaletteWithSplashy(filepath) {
  const buffer = await fs.readFile(filepath)
  const splashyPalette = await splashy(buffer);
  return _.chain(splashyPalette).map((value) => { 
    return _.replace(value, '#', '')
  }).value();
}

async function getPaletteWithColorthief(filepath) {
  const buffer = await fs.readFile(filepath)
  const colorthiefPalette = await colorthief.getPalette(buffer);
  return _.chain(colorthiefPalette).map((value) => {
    const [r,g,b] = value;
    return tinycolor({ r, g, b}).toHex();
  }).value();
}

(async () => {

  const output = [];

  await pMap(testImages, async (imagePath, index) => {
    const filepath = path.resolve(gitRoot(), imagePath);
    const basename = path.basename(filepath);
    const displayIndex = index+1;

    const nodeVibrantPalette = await getPaletteWithNodeVibrant(filepath);
    const nodeVibrantLink = await getPaletteLink(nodeVibrantPalette);
    const splashyPalette = await getPaletteWithSplashy(filepath);
    const splashyLink = await getPaletteLink(splashyPalette);
    const colorthiefPalette = await getPaletteWithColorthief(filepath);
    const colorthiefLink = await getPaletteLink(colorthiefPalette);

    output.push(`## Test ${displayIndex}`)
    output.push(`### Original image`);
    output.push(`![original image](./${basename})`);
    output.push('### Palette by `node-vibrant`');
    output.push(`[![node-vibrant](./output/node-vibrant-${displayIndex}.png)](${nodeVibrantLink})`);
    output.push('### Palette by `splashy`');
    output.push(`[![splashy](./output/splashy-${displayIndex}.png)](${splashyLink})`);
    output.push('### Palette by `colorthief`');
    output.push(`[![colorthief](./output/colorthief-${displayIndex}.png)](${colorthiefLink})`);
  }, { concurrency: 1 });

  const readmePath = absolute(gitRoot(), 'README.md');
  const readmeContent = `
# palette-test

This is a comparison of various palette-extracting libraries, on the same image.

${output.join('\n\n')}
`
  await write(readmeContent, readmePath);

})();



