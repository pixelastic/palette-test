import { promises as fs } from 'node:fs';
import { gitRoot, absolute } from 'firost';
import { getMostCommonColors } from './getMostCommonColors.js';

const buffer = await fs.readFile(absolute(gitRoot(), 'image-1.jpg'));

const mostCommonColors = await getMostCommonColors(buffer);
console.info(mostCommonColors);
