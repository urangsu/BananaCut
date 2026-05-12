const https = require('https');
const fs = require('fs');
const path = require('path');

function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${res.statusCode}`));
        return;
      }
      
      const parts = [];
      res.on('data', chunk => parts.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(parts);
        fs.writeFileSync(destPath, buffer);
        console.log(`Saved ${destPath} (Signature: ${[...buffer.slice(0, 4)].map(x => x.toString(16).padStart(2,'0')).join(' ')})`);
        resolve();
      });
    }).on('error', reject);
  });
}

async function main() {
  await downloadImage('https://placehold.co/1200x630/1e293b/facc15/png?text=BananaCut%5CnRemove+Backgrounds.+Make+It+Yours.', path.join(__dirname, '../public/images/og-image.png'));
  await downloadImage('https://placehold.co/1200x630/1e293b/facc15/png?text=BananaCut%5CnRemove+Backgrounds.+Make+It+Yours.', path.join(__dirname, '../public/images/twitter-image.png'));

  await downloadImage('https://placehold.co/400x300/10b981/fef08a/png?text=Original+Video', path.join(__dirname, '../public/images/examples/sample-before.png'));
  await downloadImage('https://placehold.co/400x300/1e293b/fef08a/png?text=Transparent+Background', path.join(__dirname, '../public/images/examples/sample-after.png'));
  await downloadImage('https://placehold.co/400x300/db2777/fef08a/png?text=Sprite+Sheet+Export', path.join(__dirname, '../public/images/examples/sample-sprite-sheet.png'));
}

main().catch(console.error);
