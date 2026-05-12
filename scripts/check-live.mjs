import https from 'https';

const urls = [
  'https://www.bananacut.art/',
  'https://www.bananacut.art/ads.txt',
  'https://www.bananacut.art/robots.txt',
  'https://www.bananacut.art/sitemap.xml',
  'https://www.bananacut.art/privacy',
  'https://www.bananacut.art/terms',
  'https://www.bananacut.art/guides',
  'https://www.bananacut.art/examples',
  'https://www.bananacut.art/images/og-image.png',
  'https://www.bananacut.art/images/twitter-image.png'
];

async function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ url, status: res.statusCode, contentType: res.headers['content-type'], body }));
    }).on('error', (err) => {
      resolve({ url, status: 'Error', error: err.message, body: '' });
    });
  });
}

async function main() {
  console.log('Checking live URLs...');
  let hasError = false;
  for (const url of urls) {
    const { status, contentType, error, body } = await checkUrl(url);
    console.log(`- ${url}: ${status} (${contentType || error || 'No Content-Type'})`);
    if (status !== 200) {
      hasError = true;
    }
    if (url.endsWith('.png') && status === 200 && (!contentType || !contentType.includes('image/png'))) {
       console.log(`  Warning: Expected image/png but got ${contentType}`);
       hasError = true;
    }
    if (url.endsWith('ads.txt') && status === 200) {
       if (!contentType || !contentType.includes('text/plain')) {
         console.log(`  Warning: Expected text/plain but got ${contentType}`);
         hasError = true;
       }
       if (!body.includes('pub-6406237368816995')) {
         console.log(`  Error: ads.txt does not contain pub-6406237368816995`);
         hasError = true;
       }
    }
  }
  
  if (hasError) {
    console.log('Some checks failed.');
    process.exit(1);
  } else {
    console.log('All checks passed!');
  }
}

main();
