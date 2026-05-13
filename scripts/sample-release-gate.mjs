
import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';

let failure = false;

function fail(msg) {
    console.error(`FAIL: ${msg}`);
    failure = true;
}

// 1. check package.json
const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));
if (pkg.dependencies && pkg.dependencies['gif.js']) fail("gif.js found in dependencies");
if (pkg.devDependencies && pkg.devDependencies['gif.js']) fail("gif.js found in devDependencies");
if (!pkg.dependencies || !pkg.dependencies['gifenc']) fail("gifenc not found");
if (!pkg.scripts || !pkg.scripts['check:release']) fail("scripts.check:release missing");

// 2. check files
const forbiddenFiles = ['./src/utils/exportEngine.ts'];
const forbiddenStrings = ["TODO", "GIF not fully implemented", 'throw new Error("Not implemented yet")'];

for (const file of forbiddenFiles) {
    if (existsSync(file)) {
        const content = readFileSync(file, 'utf8');
        for (const str of forbiddenStrings) {
            if (content.includes(str)) fail(`${str} found in ${file}`);
        }
    }
}

// 3. check required files
if (!existsSync('./QA_TEST_PLAN.md')) fail("QA_TEST_PLAN.md missing");
if (!existsSync('./RESULT.md')) fail("RESULT.md missing");

const qa = readFileSync('./QA_TEST_PLAN.md', 'utf8');
if (!qa.includes("Export Preflight Gate")) fail("Export Preflight Gate section missing in QA_TEST_PLAN.md");

const result = readFileSync('./RESULT.md', 'utf8');
const requiredResultSections = [
    "Build", "Lint", "Sample Load", "Result Only ZIP", "With RAW ZIP", 
    "GIF Preview", "GIF Fallback ZIP", "Sprite Sheet", "Sprite JSON", 
    "Network No Media Upload", "Release Gate"
];
for (const section of requiredResultSections) {
    if (!result.includes(section)) fail(`Section ${section} missing in RESULT.md`);
}

if (failure) {
    console.log("Release Gate: FAILED");
    process.exit(1);
} else {
    console.log("Release Gate: PASSED");
    process.exit(0);
}
