import { execSync } from 'child_process';
import { readFileSync, existsSync, readdirSync } from 'fs';
import path from 'path';

console.log('==================================================');
console.log('   BananaCut P0 Release Gate & Ad Isolation Audit ');
console.log('==================================================\n');

let failure = false;

function fail(msg) {
  console.error(`❌ FAIL: ${msg}`);
  failure = true;
}

function pass(msg) {
  console.log(`✅ PASS: ${msg}`);
}

// 1. Audit AdSense Isolation in Studio Pages
console.log('--- Step 1: Auditing AdSense Studio Isolation ---');
const studioPages = [
  'RemovePage.tsx',
  'RecoverPage.tsx',
  'AssetPage.tsx',
  'GuidePage.tsx'
];

for (const file of studioPages) {
  const filePath = path.join('src/pages', file);
  if (existsSync(filePath)) {
    const content = readFileSync(filePath, 'utf8');
    if (content.includes('adsbygoogle') || content.includes('googlesyndication.com') || content.includes('googleads')) {
      fail(`AdSense references detected inside Studio route page: ${filePath}`);
    } else {
      pass(`No AdSense leaks found in ${file}`);
    }
  } else {
    fail(`Studio page missing: ${filePath}`);
  }
}

// 2. Audit CMP / Cookie Consent Labels
console.log('\n--- Step 2: Checking CMP / Consent Verification ---');
const consentManagerPath = 'src/components/ConsentManager.tsx';
if (existsSync(consentManagerPath)) {
  const content = readFileSync(consentManagerPath, 'utf8');
  if (content.includes('Google-certified') || content.includes('IAB TCF') || content.includes('IAB Certified')) {
    fail(`Uncertified CMP marketing claims found in ${consentManagerPath}`);
  } else {
    pass(`ConsentManager displays honest labels and lacks uncertified CMP claims.`);
  }
} else {
  fail(`ConsentManager component missing at ${consentManagerPath}`);
}

// 3. Verify Test Fixtures exist
console.log('\n--- Step 3: Verifying Test Fixtures ---');
const requiredFixtures = [
  'test/fixtures/green-screen-2s.mp4',
  'test/fixtures/green-screen.png',
  'test/fixtures/FIXTURES.md'
];

for (const fix of requiredFixtures) {
  if (existsSync(fix)) {
    pass(`Fixture exists: ${fix}`);
  } else {
    fail(`Required test fixture missing: ${fix}`);
  }
}

// 4. Run TypeScript Compiler Checks (Linter)
console.log('\n--- Step 4: Running TypeScript Linter ---');
try {
  console.log('Running: npm run lint...');
  execSync('npm run lint', { stdio: 'inherit' });
  pass('TypeScript compilation checks passed.');
} catch (e) {
  fail('TypeScript compiler errors detected.');
}

// 5. Run Vitest Unit Tests
console.log('\n--- Step 5: Running Unit Tests ---');
try {
  console.log('Running: npm run test:unit...');
  execSync('npm run test:unit', { stdio: 'inherit' });
  pass('All Vitest unit tests passed.');
} catch (e) {
  fail('Unit tests failed.');
}

// 6. Run Playwright E2E Tests
console.log('\n--- Step 6: Running Playwright E2E Tests ---');
try {
  console.log('Running: npm run test:e2e...');
  execSync('npm run test:e2e', { stdio: 'inherit' });
  pass('All Playwright E2E tests passed.');
} catch (e) {
  fail('Playwright E2E tests failed.');
}

// 7. Overall Evaluation
console.log('\n==================================================');
if (failure) {
  console.error('❌ RELEASE GATE STATUS: FAILED');
  console.error('Please fix all outstanding issues before releasing.');
  console.log('==================================================');
  process.exit(1);
} else {
  console.log('🎉 RELEASE GATE STATUS: PASSED');
  console.log('The application is fully compliant for production release.');
  console.log('==================================================');
  process.exit(0);
}
