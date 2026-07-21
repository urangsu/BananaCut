import { execSync } from 'child_process';
import { existsSync } from 'fs';

console.log('================================================================');
console.log('       BananaCut P0 Release Gate & AdSense Review pipeline      ');
console.log('================================================================\n');

let failure = false;

function fail(msg) {
  console.error(`❌ FAIL: ${msg}`);
  failure = true;
}

function pass(msg) {
  console.log(`✅ PASS: ${msg}`);
}

function runStage(name, cmd) {
  console.log(`\n--- Running Stage: ${name} (${cmd}) ---`);
  try {
    execSync(cmd, { stdio: 'inherit' });
    pass(`${name} completed successfully.`);
  } catch (e) {
    fail(`${name} execution failed.`);
  }
}

// 1. Lint checks
runStage('TypeScript Linter', 'npm run lint');

// 2. Production compilation check
runStage('Production Compilation', 'npm run build');

// 3. AdSense specific static auditing
runStage('AdSense Compliance Audit', 'npm run check:adsense');

// 4. Unit tests
runStage('Unit Tests', 'npm run test:unit');

// 5. Playwright E2E Tests
runStage('Playwright E2E Tests', 'npm run test:e2e');

// 6. Overall Evaluation
console.log('\n================================================================');
if (failure) {
  console.error('❌ BANANACUT RELEASE GATE STATUS: FAILED');
  console.error('Please resolve any failing checks above before requesting final review.');
  console.log('================================================================');
  process.exit(1);
} else {
  console.log('🎉 BANANACUT RELEASE GATE STATUS: PASSED (GO STATE)');
  console.log('All compliance and functional pipelines are in absolute green!');
  console.log('================================================================');
  process.exit(0);
}
