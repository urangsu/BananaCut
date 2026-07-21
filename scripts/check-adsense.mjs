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

  // Must contain google-adsense-account meta tag exactly once, in any order of attributes
  const metaMatches = content.match(/<meta[^>]*name="google-adsense-account"[^>]*>/g) || 
                      content.match(/<meta[^>]*content="ca-pub-6406237368816995"[^>]*name="google-adsense-account"[^>]*>/g) || [];
  
  assert(metaMatches.length === 1, 'index.html contains google-adsense-account meta tag exactly 1 time');
  
  // Verify correct publisher ID attribute
  const correctMeta = content.includes('name="google-adsense-account"') && content.includes('content="ca-pub-6406237368816995"');
  assert(correctMeta, 'index.html verification meta tag contains correct publisher ID ca-pub-6406237368816995');

  // Verify other publishers or empty publishers do not exist
  const emptyOrBadPub = /content="ca-pub-(?!6406237368816995)\d+"/g.test(content);
  assert(!emptyOrBadPub, 'index.html contains no invalid ca-pub publisher IDs');

  // Must NOT contain AdSense JavaScript URLs
  assert(!content.includes('pagead2.googlesyndication.com'), 'index.html contains 0 pagead2.googlesyndication.com script URLs');

  // Must NOT contain compliance comments
  assert(
    !content.includes('AdSense static code inclusion') && !content.includes('compliance check'),
    'index.html contains 0 compliance cheating comments'
  );

  assert(!content.includes('adsbygoogle.js'), 'index.html contains 0 adsbygoogle.js strings');
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

// 3. Verify ads.txt (trim and verify exact single line)
const adsTxtPath = path.resolve('public/ads.txt');
if (fs.existsSync(adsTxtPath)) {
  const content = fs.readFileSync(adsTxtPath, 'utf-8');
  const lines = content.split(/\r?\n/).map(line => line.trim()).filter(Boolean);

  assert(lines.length === 1, 'public/ads.txt contains exactly 1 active line');
  if (lines.length === 1) {
    const expectedLine = 'google.com, pub-6406237368816995, DIRECT, f08c47fec0942fa0';
    assert(lines[0] === expectedLine, 'public/ads.txt matches exact single publisher line');
  }
  assert(!content.includes('<script') && !content.includes('<html'), 'public/ads.txt does not contain any scripts or HTML');
} else {
  assert(false, 'public/ads.txt exists');
}

// 4. Verify Consent Context & Manager (analytics only, no advertising, no CMP self-certifications)
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

const consentManagerPath = path.resolve('src/components/ConsentManager.tsx');
if (fs.existsSync(consentManagerPath)) {
  const content = fs.readFileSync(consentManagerPath, 'utf-8');

  // Verify no forbidden CMP claims
  const forbiddenClaims = [
    'Google-certified CMP',
    'Google certified CMP',
    'IAB-certified',
    'IAB TCF compliant',
    'Certified consent platform',
    '인증 CMP',
    'Google 인증 동의 플랫폼입니다'
  ];
  forbiddenClaims.forEach(claim => {
    assert(!content.includes(claim), `ConsentManager.tsx contains 0 occurrences of forbidden CMP claim: "${claim}"`);
  });

  // Verify no user-controlled advertising toggles or state keys
  assert(
    !content.includes('localAds') && !content.includes('advertising toggle') && !content.includes('ad_personalization'),
    'ConsentManager.tsx contains 0 advertising toggles'
  );
} else {
  assert(false, 'src/components/ConsentManager.tsx exists');
}

// 5. Verify SEO Noindex and Index directives in React files
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

// 6. Verify Sitemap.xml exclusions
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

// 7. Verify Privacy Policy page mandatory contents
const privacyPagePath = path.resolve('src/pages/PrivacyPage.tsx');
if (fs.existsSync(privacyPagePath)) {
  const content = fs.readFileSync(privacyPagePath, 'utf-8');

  // Verify mandatory keywords
  const requiredKeywords = [
    'Google AdSense',
    'Google Privacy & messaging',
    'hello@bananacut.art',
    '시행일',
    '최종 수정일',
    'Effective date',
    'Last updated',
    'analytics'
  ];
  requiredKeywords.forEach(keyword => {
    assert(content.includes(keyword), `PrivacyPage.tsx contains required keyword: "${keyword}"`);
  });

  // Verify conditional advertising expression
  const krConditional = content.includes('광고 서비스가 활성화되는 경우');
  const enConditional = content.includes('If advertising services are enabled');
  const jpConditional = content.includes('広告サービスが有効になった場合');

  assert(krConditional, 'PrivacyPage.tsx contains KR conditional ad expression');
  assert(enConditional, 'PrivacyPage.tsx contains EN conditional ad expression');
  assert(jpConditional, 'PrivacyPage.tsx contains JP conditional ad expression');

  // Verify absence of outdated definitive cookie statements
  const outdatedKR = content.includes('BananaCut은 맞춤형 광고 게재를 위해 쿠키를 사용합니다');
  const outdatedEN = content.includes('BananaCut uses cookies for delivering personalized advertising');
  assert(!outdatedKR, 'PrivacyPage.tsx does NOT contain outdated KR definitive ad cookie statement');
  assert(!outdatedEN, 'PrivacyPage.tsx does NOT contain outdated EN definitive ad cookie statement');
} else {
  assert(false, 'PrivacyPage.tsx exists');
}

if (hasError) {
  console.log('\n❌ AdSense Verification Architecture Check Failed!');
  process.exit(1);
} else {
  console.log('\n✨ AdSense Verification Architecture Check Passed!');
}
