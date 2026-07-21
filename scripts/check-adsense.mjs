import fs from 'fs';
import path from 'path';

let hasError = false;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ [FAIL] ${message}`);
    hasError = true;
  } else {
    console.log(`✅ [PASS] ${message}`);
  }
}

// 1. Verify index.html requirements
const indexHtmlPath = path.resolve('index.html');
if (fs.existsSync(indexHtmlPath)) {
  const content = fs.readFileSync(indexHtmlPath, 'utf-8');

  // Must contain google-adsense-account meta tag exactly once
  const metaMatches = content.match(/<meta[^>]*name="google-adsense-account"[^>]*>/g) || [];
  assert(metaMatches.length === 1, 'index.html contains google-adsense-account meta tag exactly 1 time');
  
  if (metaMatches.length === 1) {
    assert(
      metaMatches[0].includes('ca-pub-6406237368816995'),
      'index.html verification meta tag contains correct publisher ID ca-pub-6406237368816995'
    );
  }

  // Must NOT contain AdSense JavaScript URLs
  assert(
    !content.includes('pagead2.googlesyndication.com'),
    'index.html contains 0 pagead2.googlesyndication.com script URLs'
  );

  // Must NOT contain compliance comments or adsbygoogle.js strings
  assert(
    !content.includes('AdSense static code inclusion') && !content.includes('compliance check'),
    'index.html contains 0 compliance cheating comments'
  );

  assert(
    !content.includes('adsbygoogle.js'),
    'index.html contains 0 adsbygoogle.js strings'
  );
} else {
  assert(false, 'index.html exists');
}

// 2. Scan src directory for compliance
let adsenseScriptInjected = false;
let adsensePushFound = false;
let adSlotAttrFound = false;
let adSlotImportOrRenderFound = false;

function scanDir(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        scanDir(fullPath, callback);
      }
    } else {
      callback(fullPath);
    }
  }
}

scanDir('src', (filePath) => {
  const content = fs.readFileSync(filePath, 'utf-8');

  if (content.includes('pagead2.googlesyndication.com')) {
    adsenseScriptInjected = true;
  }
  if (content.includes('adsbygoogle.push')) {
    adsensePushFound = true;
  }
  if (content.includes('data-ad-slot')) {
    adSlotAttrFound = true;
  }

  // Check for rendering or importing of AdSlot in files other than the component itself
  if (path.resolve(filePath) !== path.resolve('src/components/ads/AdSlot.tsx')) {
    if (content.includes('AdSlot') && (content.includes('<AdSlot') || content.includes('import'))) {
      adSlotImportOrRenderFound = true;
    }
  }
});

assert(!adsenseScriptInjected, 'src directory contains 0 pagead2.googlesyndication.com references');
assert(!adsensePushFound, 'src directory contains 0 adsbygoogle.push calls');
assert(!adSlotAttrFound, 'src directory contains 0 data-ad-slot attributes');
assert(!adSlotImportOrRenderFound, 'No AdSlot components are imported or rendered outside src/components/ads/AdSlot.tsx');

// 3. Verify ads.txt
const adsTxtPath = path.resolve('public/ads.txt');
if (fs.existsSync(adsTxtPath)) {
  const content = fs.readFileSync(adsTxtPath, 'utf-8').trim();
  const expectedLine = 'google.com, pub-6406237368816995, DIRECT, f08c47fec0942fa0';
  assert(content === expectedLine, 'public/ads.txt matches exact single publisher line');
  assert(!content.includes('<script') && !content.includes('<html'), 'public/ads.txt does not contain any scripts or HTML');
} else {
  assert(false, 'public/ads.txt exists');
}

// 4. Verify Consent Context (analytics only, no advertising, no CMP self-certifications)
const consentContextPath = path.resolve('src/ConsentContext.tsx');
if (fs.existsSync(consentContextPath)) {
  const content = fs.readFileSync(consentContextPath, 'utf-8');
  assert(
    !content.includes('ads:') && !content.includes('ads_storage') && !content.includes('ad_storage'),
    'src/ConsentContext.tsx contains 0 advertising consent states'
  );
  assert(
    content.includes('analytics'),
    'src/ConsentContext.tsx contains analytics-only consent states'
  );
} else {
  assert(false, 'src/ConsentContext.tsx exists');
}

// 5. Verify SEO Noindex and Index directives
const noindexPages = [
  { path: 'src/pages/RemovePage.tsx', name: 'RemovePage' },
  { path: 'src/pages/RecoverPage.tsx', name: 'RecoverPage' },
  { path: 'src/pages/AssetPage.tsx', name: 'AssetPage' },
  { path: 'src/pages/GuidePage.tsx', name: 'GuidePage' }
];

noindexPages.forEach((page) => {
  const pagePath = path.resolve(page.path);
  if (fs.existsSync(pagePath)) {
    const content = fs.readFileSync(pagePath, 'utf-8');
    assert(
      content.includes('noindex'),
      `${page.name} contains noindex SEO search directive`
    );
  } else {
    assert(false, `${page.name} exists`);
  }
});

const indexPages = [
  { path: 'src/pages/LandingPage.tsx', name: 'LandingPage' },
  { path: 'src/pages/GuidesIndexPage.tsx', name: 'GuidesIndexPage' },
  { path: 'src/pages/AboutPage.tsx', name: 'AboutPage' },
  { path: 'src/pages/PrivacyPage.tsx', name: 'PrivacyPage' },
  { path: 'src/pages/TermsPage.tsx', name: 'TermsPage' }
];

indexPages.forEach((page) => {
  const pagePath = path.resolve(page.path);
  if (fs.existsSync(pagePath)) {
    const content = fs.readFileSync(pagePath, 'utf-8');
    assert(
      !content.includes('noindex'),
      `${page.name} does NOT contain noindex (open for crawling)`
    );
  } else {
    assert(false, `${page.name} exists`);
  }
});

// 6. Verify Sitemap.xml
const sitemapPath = path.resolve('public/sitemap.xml');
if (fs.existsSync(sitemapPath)) {
  const content = fs.readFileSync(sitemapPath, 'utf-8');
  assert(
    !content.includes('bananacut.art/remove') &&
    !content.includes('bananacut.art/recover') &&
    !content.includes('bananacut.art/asset') &&
    !content.includes('bananacut.art/guide<') &&
    !content.includes('bananacut.art/guide/'),
    'sitemap.xml does not contain Studio/Guide editor routes (remove, recover, asset, guide)'
  );
  assert(
    content.includes('bananacut.art/guides'),
    'sitemap.xml includes /guides list route'
  );
} else {
  assert(false, 'public/sitemap.xml exists');
}

if (hasError) {
  console.log('\n❌ AdSense Verification Architecture Check Failed!');
  process.exit(1);
} else {
  console.log('\n✨ AdSense Verification Architecture Check Passed!');
}
