import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function svgToPng(svgPath, destPath, w, h) {
  const svgBuffer = fs.readFileSync(svgPath);
  const pngBuffer = await sharp(svgBuffer)
    .resize(w, h)
    .png()
    .toBuffer();
    
  fs.writeFileSync(destPath, pngBuffer);
  
  const b = fs.readFileSync(destPath);
  const sig = [...b.slice(0,8)].map(x=>x.toString(16).padStart(2,'0')).join(' ');
  const b64 = b.toString('base64').slice(0,12);
  console.log(`Saved ${destPath}`);
  console.log(`  Signature: ${sig}`);
  console.log(`  Base64: ${b64}...`);
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
