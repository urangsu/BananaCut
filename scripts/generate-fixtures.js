import fs from 'fs';
import path from 'path';

const fixturesDir = path.resolve('test/fixtures');

if (!fs.existsSync(fixturesDir)) {
  fs.mkdirSync(fixturesDir, { recursive: true });
}

// 1x1 Green PNG Base64
const greenPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
fs.writeFileSync(
  path.join(fixturesDir, 'green-screen.png'),
  Buffer.from(greenPngBase64, 'base64')
);

// Minimal dummy MP4 (simple box structure)
const dummyMp4Base64 = 'AAAAIGZ0eXBtcDQyAAAAAG1wNDJpc29tYXZjMQAAAAgnd2lkZQAAAGxtZGF0';
fs.writeFileSync(
  path.join(fixturesDir, 'mock-video.mp4'),
  Buffer.from(dummyMp4Base64, 'base64')
);

console.log('Successfully generated green-screen.png and mock-video.mp4 fixtures!');
