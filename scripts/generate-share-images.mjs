import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function svgToPng(svgPath, destPath, w, h) {
  const svgBuffer = fs.readFileSync(svgPath);
  await sharp(svgBuffer)
    .resize(w, h)
    .png()
    .toFile(destPath);
  console.log(`Saved ${destPath}`);
}

async function main() {
  const root = path.resolve();
  await svgToPng(path.join(root, 'public/images/og-image.svg'), path.join(root, 'public/images/og-image.png'), 1200, 630);
  await svgToPng(path.join(root, 'public/images/twitter-image.svg'), path.join(root, 'public/images/twitter-image.png'), 1200, 630);
  await svgToPng(path.join(root, 'public/images/examples/green-screen-before.svg'), path.join(root, 'public/images/examples/sample-before.png'), 400, 300);
  await svgToPng(path.join(root, 'public/images/examples/green-screen-after.svg'), path.join(root, 'public/images/examples/sample-after.png'), 400, 300);
  await svgToPng(path.join(root, 'public/images/examples/sprite-sheet-example.svg'), path.join(root, 'public/images/examples/sample-sprite-sheet.png'), 400, 300);
}

main().catch(console.error);
