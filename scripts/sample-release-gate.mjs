
import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';

let failure = false;

function fail(msg) {
    console.error(`FAIL: ${msg}`);
    failure = true;
}

// 1. check package.json for gif.js
const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));
if (pkg.dependencies && pkg.dependencies['gif.js']) fail("gif.js found in dependencies");
if (pkg.devDependencies && pkg.devDependencies['gif.js']) fail("gif.js found in devDependencies");

// 2. check gifenc
if (!pkg.dependencies || !pkg.dependencies['gifenc']) fail("gifenc not found");

// 3. check TODOs
const engine = readFileSync('./src/utils/exportEngine.ts', 'utf8');
if (engine.includes('TODO')) fail("TODOs found in exportEngine.ts");
if (engine.includes('GIF not fully implemented')) fail("Unimplemented GIF found");

// 4. check files
if (!existsSync('./QA_TEST_PLAN.md')) fail("QA_TEST_PLAN.md missing");
if (!existsSync('./RESULT.md')) fail("RESULT.md missing");

if (failure) {
    console.log("Release Gate: FAILED");
    process.exit(1);
} else {
    console.log("Release Gate: PASSED");
    process.exit(0);
}
