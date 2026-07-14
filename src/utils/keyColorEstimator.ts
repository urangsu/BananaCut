/**
 * Estimates the background key color of an image by analyzing border and corner pixels.
 * This is highly useful for automatically detecting green screens, white backgrounds, or dark studios.
 */
export function estimateKeyColor(imageData: ImageData): { r: number; g: number; b: number } {
  const { data, width, height } = imageData;
  const samplePixels: { r: number; g: number; b: number }[] = [];

  // Sample borders and corners (top, bottom, left, right edges)
  const borderThickness = Math.max(1, Math.floor(Math.min(width, height) * 0.02)); // top 2% of dimension

  // Sample top and bottom rows
  for (let y = 0; y < borderThickness; y++) {
    for (let x = 0; x < width; x += 4) { // step by 4 to sample quickly
      const idx = (y * width + x) * 4;
      samplePixels.push({ r: data[idx], g: data[idx + 1], b: data[idx + 2] });
    }
  }

  for (let y = height - borderThickness; y < height; y++) {
    for (let x = 0; x < width; x += 4) {
      const idx = (y * width + x) * 4;
      samplePixels.push({ r: data[idx], g: data[idx + 1], b: data[idx + 2] });
    }
  }

  // Sample left and right columns (excluding corners already sampled)
  for (let y = borderThickness; y < height - borderThickness; y += 4) {
    for (let x = 0; x < borderThickness; x++) {
      const idx = (y * width + x) * 4;
      samplePixels.push({ r: data[idx], g: data[idx + 1], b: data[idx + 2] });
    }
    for (let x = width - borderThickness; x < width; x++) {
      const idx = (y * width + x) * 4;
      samplePixels.push({ r: data[idx], g: data[idx + 1], b: data[idx + 2] });
    }
  }

  if (samplePixels.length === 0) {
    return { r: 0, g: 255, b: 0 }; // Default to classic green screen
  }

  // Simple and highly effective clustering: Bucket colors into a 3D color grid (dividing RGB by 16)
  // to find the most dominant background cluster.
  const buckets: { [key: string]: { rSum: number; gSum: number; bSum: number; count: number } } = {};

  for (const pixel of samplePixels) {
    const rBucket = Math.floor(pixel.r / 16);
    const gBucket = Math.floor(pixel.g / 16);
    const bBucket = Math.floor(pixel.b / 16);
    const key = `${rBucket},${gBucket},${bBucket}`;

    if (!buckets[key]) {
      buckets[key] = { rSum: 0, gSum: 0, bSum: 0, count: 0 };
    }
    buckets[key].rSum += pixel.r;
    buckets[key].gSum += pixel.g;
    buckets[key].bSum += pixel.b;
    buckets[key].count++;
  }

  // Find the bucket with the highest count
  let dominantKey = '';
  let maxCount = -1;

  for (const key in buckets) {
    if (buckets[key].count > maxCount) {
      maxCount = buckets[key].count;
      dominantKey = key;
    }
  }

  if (!dominantKey) {
    return { r: 0, g: 255, b: 0 };
  }

  const dom = buckets[dominantKey];
  return {
    r: Math.round(dom.rSum / dom.count),
    g: Math.round(dom.gSum / dom.count),
    b: Math.round(dom.bSum / dom.count),
  };
}
