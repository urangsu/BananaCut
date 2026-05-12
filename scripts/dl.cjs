const https = require('https');
const fs = require('fs');

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  await downloadFile('https://placehold.co/1200x630/1e293b/facc15/png?text=BananaCut%5CnRemove+Backgrounds.+Make+It+Yours.', 'public/images/og-image.png');
  await downloadFile('https://placehold.co/1200x630/1e293b/facc15/png?text=BananaCut%5CnRemove+Backgrounds.+Make+It+Yours.', 'public/images/twitter-image.png');

  await downloadFile('https://placehold.co/400x300/10b981/fef08a/png?text=Original+Video', 'public/images/examples/sample-before.png');
  await downloadFile('https://placehold.co/400x300/1e293b/fef08a/png?text=Transparent+Background', 'public/images/examples/sample-after.png');
  await downloadFile('https://placehold.co/400x300/db2777/fef08a/png?text=Sprite+Sheet+Export', 'public/images/examples/sample-sprite-sheet.png');

  console.log('Images downloaded!');
}

main();
