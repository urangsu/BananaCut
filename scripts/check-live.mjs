import fs from 'fs';

const urls = [
  'https://bananacut.art/',
  'http://bananacut.art/ads.txt',
  'https://bananacut.art/ads.txt',
  'https://www.bananacut.art/',
  'http://www.bananacut.art/ads.txt',
  'https://www.bananacut.art/ads.txt',
  'https://www.bananacut.art/robots.txt',
  'https://www.bananacut.art/sitemap.xml',
  'https://www.bananacut.art/guides',
  'https://www.bananacut.art/guides/remove-background-from-video',
  'https://www.bananacut.art/guides/ai-video-to-game-asset',
  'https://www.bananacut.art/guides/sprite-sheet-generator',
  'https://www.bananacut.art/guides/clean-alpha-edges',
  'https://www.bananacut.art/examples',
  'https://www.bananacut.art/about',
  'https://www.bananacut.art/contact',
  'https://www.bananacut.art/privacy',
  'https://www.bananacut.art/terms',
  'https://www.bananacut.art/favicon.svg',
  'https://www.bananacut.art/images/og-image.png',
  'https://www.bananacut.art/images/twitter-image.png'
];

async function checkUrl(url) {
  const result = {
    requestedUrl: url,
    finalUrl: null,
    status: null,
    contentType: null,
    redirected: false,
    bodyLength: 0,
    bodyText: '',
    error: null
  };

  try {
    const response = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'BananaCut-Live-Check/1.0'
      }
    });

    result.status = response.status;
    result.finalUrl = response.url;
    result.redirected = response.redirected;
    result.contentType = response.headers.get('content-type') || '';

    if (result.contentType.includes('image/png')) {
      const buffer = await response.arrayBuffer();
      result.bodyLength = buffer.byteLength;
    } else {
      const text = await response.text();
      result.bodyText = text;
      result.bodyLength = text.length;
    }
  } catch (err) {
    result.error = err.message;
  }

  return result;
}

async function main() {
  console.log('================================================================');
  console.log('             BananaCut Live Deployment Verifier                 ');
  console.log('================================================================\n');

  let hasError = false;

  for (const url of urls) {
    console.log(`Checking: ${url}`);
    const res = await checkUrl(url);

    if (res.error) {
      console.log(`❌ Network Error: Could not resolve or fetch ${url}. Error: ${res.error}`);
      console.log('  (This is expected if live DNS is not yet fully propagated or if in offline sandbox.)\n');
      hasError = true;
      continue;
    }

    console.log(`   -> Final URL:  ${res.finalUrl}`);
    console.log(`   -> Status:     ${res.status}`);
    console.log(`   -> Redirected: ${res.redirected}`);
    console.log(`   -> Type:       ${res.contentType}`);
    console.log(`   -> Length:     ${res.bodyLength} bytes`);

    // 1. Common validation
    if (res.status !== 200) {
      console.log(`❌ Fail: Expected HTTP 200, got ${res.status}`);
      hasError = true;
    }
    if (res.bodyLength === 0) {
      console.log(`❌ Fail: Body is empty`);
      hasError = true;
    }

    // 2. HTML verification
    const isHtml = res.contentType.includes('text/html');
    if (isHtml) {
      const body = res.bodyText;
      
      // Check brand presence
      if (!body.includes('BananaCut')) {
        console.log(`❌ Fail: HTML body missing brand keyword 'BananaCut'`);
        hasError = true;
      }
      // Check Verification meta presence
      if (!body.includes('google-adsense-account') || !body.includes('ca-pub-6406237368816995')) {
        console.log(`❌ Fail: HTML body missing valid Google AdSense account meta tag`);
        hasError = true;
      }
      // Check zero active scripts before approval
      if (body.includes('pagead2.googlesyndication.com') || body.includes('adsbygoogle.js')) {
        console.log(`❌ Fail: Script tags for live AdSense active code detected in DOM!`);
        hasError = true;
      }
      // Check for server error indications
      const serverErrors = ['Internal Server Error', 'Application Error', 'DEPLOYMENT_NOT_FOUND', '404: NOT_FOUND'];
      for (const errText of serverErrors) {
        if (body.includes(errText)) {
          console.log(`❌ Fail: Detected hosting platform error keyword: "${errText}"`);
          hasError = true;
        }
      }
    }

    // 3. ads.txt verification
    if (url.endsWith('/ads.txt')) {
      const isTxt = res.contentType.includes('text/plain');
      const body = res.bodyText;
      if (!isTxt) {
        console.log(`❌ Fail: ads.txt must be served as text/plain, got: ${res.contentType}`);
        hasError = true;
      }
      if (body.includes('<!DOCTYPE html>') || body.includes('<html') || body.includes('<div id="root">')) {
        console.log(`❌ Fail: ads.txt contains HTML tags`);
        hasError = true;
      }
      const expectedLine = 'google.com, pub-6406237368816995, DIRECT, f08c47fec0942fa0';
      const lines = body.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
      
      if (lines.length !== 1) {
        console.log(`❌ Fail: ads.txt has ${lines.length} lines, expected exactly 1 line.`);
        hasError = true;
      }
      if (lines[0] !== expectedLine) {
        console.log(`❌ Fail: ads.txt line content mismatch.\n   Expected: "${expectedLine}"\n   Got:      "${lines[0]}"`);
        hasError = true;
      }
    }

    // 4. robots.txt verification
    if (url.endsWith('/robots.txt')) {
      const body = res.bodyText;
      if (!body.includes('User-agent')) {
        console.log(`❌ Fail: robots.txt missing "User-agent" keyword`);
        hasError = true;
      }
      if (!body.includes('Sitemap')) {
        console.log(`❌ Fail: robots.txt missing "Sitemap" URL registration`);
        hasError = true;
      }
      // Ensure no full site blocking
      const disallowAllLines = body.split(/\r?\n/).map(l => l.trim().toLowerCase());
      if (disallowAllLines.includes('disallow: /') && !disallowAllLines.some(l => l.startsWith('allow:'))) {
        console.log(`❌ Fail: robots.txt fully blocks search engines with 'Disallow: /'`);
        hasError = true;
      }
    }

    // 5. sitemap.xml verification
    if (url.endsWith('/sitemap.xml')) {
      const body = res.bodyText;
      if (!body.includes('<urlset')) {
        console.log(`❌ Fail: sitemap.xml missing root <urlset> tag`);
        hasError = true;
      }
      if (!body.includes('/guides')) {
        console.log(`❌ Fail: sitemap.xml missing /guides path`);
        hasError = true;
      }
      if (!body.includes('/guides/remove-background-from-video')) {
        console.log(`❌ Fail: sitemap.xml missing detailed guide path`);
        hasError = true;
      }
      const excluded = ['/remove</loc>', '/recover</loc>', '/asset</loc>', '/guide</loc>'];
      for (const ex of excluded) {
        if (body.includes(ex)) {
          console.log(`❌ Fail: sitemap.xml contains illegal route reference: "${ex}"`);
          hasError = true;
        }
      }
    }

    // 6. Image asset verification
    if (url.endsWith('/favicon.svg')) {
      const body = res.bodyText;
      if (!res.contentType.includes('image/svg+xml')) {
        console.log(`❌ Fail: favicon.svg should be image/svg+xml`);
        hasError = true;
      }
      if (!body.includes('<svg')) {
        console.log(`❌ Fail: favicon.svg missing <svg> root element`);
        hasError = true;
      }
    }

    if (url.endsWith('.png')) {
      if (!res.contentType.includes('image/png')) {
        console.log(`❌ Fail: PNG image must be image/png`);
        hasError = true;
      }
      if (res.bodyLength < 100) {
        console.log(`❌ Fail: PNG asset length is suspiciously small (${res.bodyLength} bytes)`);
        hasError = true;
      }
    }

    console.log(); // Blank line between logs
  }

  console.log('================================================================');
  if (hasError) {
    console.log('❌ Live Deployment Verification FAILED or DNS not resolved yet.');
    process.exit(1);
  } else {
    console.log('✨ All Live Deployment Verification Checks PASSED!');
    process.exit(0);
  }
}

main();
