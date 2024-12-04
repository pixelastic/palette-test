import Vibrant from 'node-vibrant';
import splashy from 'splashy';
import colorthief from 'colorthief';
import _ from 'lodash';
import tinycolor from 'tinycolor2';
import path from 'node:path';
import { promises as fs } from 'node:fs';

const testImagePath = path.resolve('./image-01.jpg');

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

async function getPaletteWithColorThief(filepath) {
  const colorThiefPalette = await colorthief.getPalette(filepath);
  return _.chain(colorThiefPalette).map((value) => {
    const [r,g,b] = value;
    return tinycolor({ r, g, b}).toHex();
  }).value();
}

(async () => {
  const nodeVibrantPalette = await getPaletteWithNodeVibrant(testImagePath);
  const splashyPalette = await getPaletteWithSplashy(testImagePath);
  const colorThiefPalette = await getPaletteWithColorThief(testImagePath);

  console.info(`
  [node-vibrant]: ${getPaletteLink(nodeVibrantPalette)}
  [splashy]: ${getPaletteLink(splashyPalette)}
  [colorthief]: ${getPaletteLink(colorThiefPalette)}
  `);
})();



