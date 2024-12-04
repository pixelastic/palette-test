import { _ } from 'golgoth';
import sharp from 'sharp';
import quantize from '@lokesh.dhakar/quantize';
import tinycolor from 'tinycolor2';

/**
 * Extract the most common colors from an image buffer
 * @param {string} buffer The buffer of the image to analyze
 * @returns {Promise<string[]>} Array of hex color codes extracted from the image
 */
export async function getMostCommonColors(buffer) {
  const sharpImg = await getSharpImg(buffer);

  // Get raw list of pixels and number of them
  const rawPixelArray = await getRawPixelArray(sharpImg);
  const pixelCount = await getPixelCount(sharpImg);
  const pixelArray = createPixelArray(rawPixelArray, pixelCount);

  // Quantize and get the 10 most common
  const colorCount = 10;
  const cmap = quantize(pixelArray, colorCount);
  const rgbPalette = cmap ? cmap.palette() : null;

  // Convert to rgb
  return _.chain(rgbPalette)
    .map((value) => {
      const [r, g, b] = value;
      return tinycolor({ r, g, b }).toHex();
    })
    .value();
}

/**
 * Returns a sharp instance from a buffer
 * @param {buffer} buffer Buffer of the image
 * @returns {object} Sharp object
 */
async function getSharpImg(buffer) {
  const bufferFromImg = await sharp(buffer).toBuffer();
  return sharp(bufferFromImg);
}

/**
 * Returns the number of pixels in the given sharp image
 * @param {object} sharpImg Sharp object
 * @returns {number} Number of pixels of the image
 */
async function getPixelCount(sharpImg) {
  const { width, height } = await sharpImg.metadata();
  return width * height;
}

/**
 * Returns an array of raw pixels
 * @param {object} sharpImg Sharp object
 * @returns {Uint8Array} Array of raw pixels
 */
async function getRawPixelArray(sharpImg) {
  const pixelBuffer = await sharpImg.ensureAlpha().raw().toBuffer();
  return new Uint8Array(pixelBuffer);
}

/**
 * Converts the array of raw pixels into an array of rgb values
 * @param {Uint8Array} rawPixelArray Array of raw pixels
 * @param {number} pixelCount Number of pixels of the image
 * @returns {Array} Array of [r, g, b]
 */
function createPixelArray(rawPixelArray, pixelCount) {
  const quality = 10;
  const pixelArray = [];

  for (let i = 0, offset, r, g, b, a; i < pixelCount; i += quality) {
    offset = i * 4;
    r = rawPixelArray[offset];
    g = rawPixelArray[offset + 1];
    b = rawPixelArray[offset + 2];
    a = rawPixelArray[offset + 3];

    // If pixel is mostly opaque and not white
    if (
      (typeof a === 'undefined' || a >= 125) &&
      !(r > 250 && g > 250 && b > 250)
    )
      pixelArray.push([r, g, b]);
  }

  return pixelArray;
}
