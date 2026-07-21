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

// 1. Verify index.html contains AdSense script tag
const indexHtmlPath = path.resolve('index.html');
if (fs.existsSync(indexHtmlPath)) {
  const content = fs.readFileSync(indexHtmlPath, 'utf-8');
  assert(
    content.includes('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6406237368816995'),
    'index.html contains exact AdSense script snippet'
  );
} else {
  assert(false, 'index.html exists');
}

// 2. Verify Consent system is analytics-only
const consentContextPath = path.resolve('src/ConsentContext.tsx');
if (fs.existsSync(consentContextPath)) {
  const content = fs.readFileSync(consentContextPath, 'utf-8');
  assert(
    !content.includes('ads:') && !content.includes('ads: boolean'),
    'ConsentContext.tsx does not contain "ads" consent state'
  );
  assert(
    content.includes('analytics:'),
    'ConsentContext.tsx retains "analytics" consent state'
  );
} else {
  assert(false, 'src/ConsentContext.tsx exists');
}

// 3. Verify Studio pages contain noindex
const removePagePath = path.resolve('src/pages/RemovePage.tsx');
if (fs.existsSync(removePagePath)) {
  const content = fs.readFileSync(removePagePath, 'utf-8');
  assert(
    content.includes('noindex') || content.includes('noindex={true}'),
    'RemovePage.tsx contains noindex search directive'
  );
} else {
  assert(false, 'RemovePage.tsx exists');
}

const recoverPagePath = path.resolve('src/pages/RecoverPage.tsx');
if (fs.existsSync(recoverPagePath)) {
  const content = fs.readFileSync(recoverPagePath, 'utf-8');
  assert(
    content.includes('noindex') || content.includes('noindex={true}'),
    'RecoverPage.tsx contains noindex search directive'
  );
} else {
  assert(false, 'RecoverPage.tsx exists');
}

const assetPagePath = path.resolve('src/pages/AssetPage.tsx');
if (fs.existsSync(assetPagePath)) {
  const content = fs.readFileSync(assetPagePath, 'utf-8');
  assert(
    content.includes('noindex') || content.includes('noindex={true}'),
    'AssetPage.tsx contains noindex search directive'
  );
} else {
  assert(false, 'AssetPage.tsx exists');
}

// 4. Verify sitemap.xml does not contain Studio routes
const sitemapPath = path.resolve('public/sitemap.xml');
if (fs.existsSync(sitemapPath)) {
  const content = fs.readFileSync(sitemapPath, 'utf-8');
  assert(
    !content.includes('bananacut.art/remove<') &&
    !content.includes('bananacut.art/remove/') &&
    !content.includes('bananacut.art/recover<') &&
    !content.includes('bananacut.art/recover/') &&
    !content.includes('bananacut.art/asset<') &&
    !content.includes('bananacut.art/asset/'),
    'sitemap.xml does not contain Studio routes (exact /remove, /recover, /asset)'
  );
} else {
  assert(false, 'public/sitemap.xml exists');
}

if (hasError) {
  console.log('\n❌ AdSense Compliance Verification Failed!');
  process.exit(1);
} else {
  console.log('\n✨ AdSense Compliance Verification Passed!');
}
