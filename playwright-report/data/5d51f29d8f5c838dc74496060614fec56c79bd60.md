# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: mediaPipeline.spec.ts >> BananaCut P0 E2E - Media Pipeline Gate >> Scenario A & B: MP4 upload, frame extraction, chromakey, and process-all flow
- Location: test/e2e/mediaPipeline.spec.ts:14:3

# Error details

```
Error: expect(locator).toBeAttached() failed

Locator: locator('[data-testid="process-complete"]')
Expected: attached
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeAttached" with timeout 15000ms
  - waiting for locator('[data-testid="process-complete"]')

```

```yaml
- text: 바나나컷은 웹사이트 환경에 최적화되어 있습니다.
- complementary:
  - img "BananaCut Logo"
  - text: BananaCut BY. DALGRACSTUDIO
  - navigation:
    - link "REMOVE 배경 제거":
      - /url: /remove
      - img
      - text: REMOVE 배경 제거
    - link "RECOVER 가장자리 복구":
      - /url: /recover
      - img
      - text: RECOVER 가장자리 복구
    - link "ASSET 에셋 내보내기":
      - /url: /asset
      - img
      - text: ASSET 에셋 내보내기
  - link "앱 가이드":
    - /url: /guide
  - button "다크 모드"
  - link "개인정보":
    - /url: /privacy
  - link "피드백":
    - /url: https://tally.so/r/44vorO
  - button "🍌 후원하기"
  - button "더보기"
  - text: © 2026 BananaCut
- main:
  - button "앱 다운로드"
  - button "KR"
  - button "EN"
  - button "JP"
  - heading "REMOVE (투명화)" [level=1]
  - paragraph: In-Browser White Background Removal
  - heading "1. Upload File (파일 업로드)" [level=2]
  - paragraph: MP4/MOV를 올리면 프레임으로 나누고, 배경 제거 후 에셋으로 내보낼 수 있습니다.
  - paragraph: 24 frames ready
  - paragraph: MP4, MOV or PNG
  - heading "2. ChromaKey (투명화)" [level=2]
  - button "Exclusion Brush (제외 브러쉬)"
  - button "Exclusion Eraser (제외 지우개)"
  - paragraph: 피커로 배경색을 찍고, 브러시로 남길 영역을 보호하세요.
  - text: Target Color
  - button "White"
  - button "Green"
  - button "Picker"
  - text: Tolerance (허용 오차) 30
  - slider: "30"
  - paragraph: Remove more off-white pixels. (더 많은 밝은 픽셀이 제거됩니다.)
  - text: Softness (가장자리 페더링) 20
  - slider: "20"
  - paragraph: Smooth out the edges. (가장자리가 부드러워집니다.)
  - text: Enclosed Color (내부 빈틈) 10
  - slider: "10"
  - paragraph: Removes isolated colors between objects. (객체 사이의 고립된 색상을 제거합니다.)
  - button "고급 키잉 설정 (Advanced Keying)"
  - text: 적용 (Apply Process)
  - button "선택 항목 적용 (1)"
  - button "전체 적용 (24)"
  - text: "24개의 항목 처리 실패: Frame 0 Frame 1 Frame 2 Frame 3 Frame 4 Frame 5 Frame 6 Frame 7 Frame 8 Frame 9 Frame 10 Frame 11 Frame 12 Frame 13 Frame 14 Frame 15 Frame 16 Frame 17 Frame 18 Frame 19 Frame 20 Frame 21 Frame 22 Frame 23 Extraction FPS (추출 프레임) 12 FPS"
  - slider: "12"
  - heading "4. Asset Settings (에셋 설정)" [level=2]
  - text: First Name (파일명)
  - textbox "e.g. sloth": sloth
  - text: Video Presets (비디오 프리셋)
  - button "Save Current"
  - text: Video 1 — 코어 업무 루프 (8초)
  - button
  - text: Video 2 — 소통과 인터랙션 (8초)
  - button
  - text: Video 3 — 물리 드래그 앤 드롭 (8초)
  - button
  - text: Video 4 — 감정 표현 (8초)
  - button
  - text: Video 5 — 출퇴근 사이클 (8초)
  - button
  - text: Motion Segments (모션 구간)
  - button "+ Add Segment (+ 구간 추가)"
  - button "×"
  - textbox "Motion name...": idle_sitting
  - button
  - text: START (S)
  - spinbutton "START (S)": "0"
  - text: END (S)
  - spinbutton "END (S)": "2.5"
  - button "Process & Download (처리/다운로드)"
  - heading "Preview (미리보기)" [level=2]
  - text: 5 / 24
  - button "Transparent"
  - button "Black"
  - button "App UI"
  - button
  - button
  - slider: "4"
  - img "Frame 0"
  - img "Frame 1"
  - img "Frame 2"
  - img "Frame 3"
  - img "Frame 4"
  - img "Frame 5"
  - img "Frame 6"
  - img "Frame 7"
  - img "Frame 8"
  - img "Frame 9"
  - img "Frame 10"
  - img "Frame 11"
  - img "Frame 12"
  - img "Frame 13"
  - img "Frame 14"
  - img "Frame 15"
  - img "Frame 16"
  - img "Frame 17"
  - img "Frame 18"
  - img "Frame 19"
  - img "Frame 20"
  - img "Frame 21"
  - img "Frame 22"
  - img "Frame 23"
  - heading "Selection (1)" [level=3]
  - button "All"
  - button "Clear"
  - button "Apply Current to Selected" [disabled]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import path from 'path';
  3   | 
  4   | test.describe('BananaCut P0 E2E - Media Pipeline Gate', () => {
  5   | 
  6   |   test.beforeEach(async ({ page }) => {
  7   |     await page.goto('/');
  8   |     const consentBtn = page.locator('[data-testid="consent-accept-all"]');
  9   |     if (await consentBtn.count() > 0 && await consentBtn.isVisible()) {
  10  |       await consentBtn.click();
  11  |     }
  12  |   });
  13  | 
  14  |   test('Scenario A & B: MP4 upload, frame extraction, chromakey, and process-all flow', async ({ page }) => {
  15  |     // Navigate to clean route
  16  |     await page.goto('/remove');
  17  |     await expect(page).toHaveTitle(/BananaCut/);
  18  | 
  19  |     // Locate the file input using data-testid
  20  |     const fileInput = page.locator('[data-testid="remove-file-input"]').first();
  21  |     await expect(fileInput).toBeAttached();
  22  | 
  23  |     // Resolve the synthetic MP4 path
  24  |     const mp4Path = path.resolve('test/fixtures/green-screen-2s.mp4');
  25  | 
  26  |     // Upload the file
  27  |     await fileInput.setInputFiles(mp4Path);
  28  | 
  29  |     // Wait for the import plan/warning modal to appear and accept it
  30  |     const importModal = page.locator('[data-testid="import-plan-modal"]');
  31  |     await expect(importModal).toBeVisible({ timeout: 10000 });
  32  |     const confirmBtn = page.locator('[data-testid="import-plan-confirm"]');
  33  |     await confirmBtn.click();
  34  | 
  35  |     // Assert extraction progress is displayed
  36  |     const progressText = page.locator('[data-testid="extraction-progress"]');
  37  |     await expect(progressText.first()).toBeAttached();
  38  | 
  39  |     // Wait for frames ready status (up to 30 seconds for FFmpeg WASM startup and decoding)
  40  |     const completeText = page.locator('[data-testid="extraction-complete"]');
  41  |     await expect(completeText.first()).toBeVisible({ timeout: 45000 });
  42  | 
  43  |     // Verify frames are loaded and frame-count shows 24 frames
  44  |     const frameCount = page.locator('[data-testid="frame-count"]');
  45  |     await expect(frameCount).toContainText('24');
  46  | 
  47  |     // Select settings and process all frames using process-key-button
  48  |     const processBtn = page.locator('[data-testid="process-key-button"]');
  49  |     await expect(processBtn).toBeEnabled();
  50  |     await processBtn.click();
  51  | 
  52  |     // Verify batch processing finishes and displays process-complete
  53  |     const processComplete = page.locator('[data-testid="process-complete"]');
> 54  |     await expect(processComplete).toBeAttached({ timeout: 15000 });
      |                                   ^ Error: expect(locator).toBeAttached() failed
  55  | 
  56  |     // Open Download format selection modal
  57  |     const downloadOpenBtn = page.locator('[data-testid="download-modal-open"]');
  58  |     await expect(downloadOpenBtn).toBeEnabled();
  59  |     await downloadOpenBtn.click();
  60  | 
  61  |     // Verify modal options are shown
  62  |     const zipDownloadBtn = page.locator('[data-testid="export-zip"]');
  63  |     await expect(zipDownloadBtn).toBeVisible();
  64  | 
  65  |     const gifDownloadBtn = page.locator('[data-testid="export-gif"]');
  66  |     await expect(gifDownloadBtn).toBeVisible();
  67  |   });
  68  | 
  69  |   test('Scenario C: Recover brush masking parameter controls', async ({ page }) => {
  70  |     // Navigate to clean recover route
  71  |     await page.goto('/recover');
  72  | 
  73  |     // Check if recovery workspace canvas and controls are displayed
  74  |     const canvas = page.locator('[data-testid="recover-canvas"]');
  75  |     await expect(canvas).toBeAttached();
  76  | 
  77  |     // Check if brush parameter sliders (size, opacity, hardness, feather) exist
  78  |     const sizeRange = page.locator('[data-testid="recover-brush-size"]');
  79  |     const opacityRange = page.locator('[data-testid="recover-brush-opacity"]');
  80  |     const hardnessRange = page.locator('[data-testid="recover-brush-hardness"]');
  81  |     const featherRange = page.locator('[data-testid="recover-brush-feather"]');
  82  | 
  83  |     await expect(sizeRange).toBeAttached();
  84  |     await expect(opacityRange).toBeAttached();
  85  |     await expect(hardnessRange).toBeAttached();
  86  |     await expect(featherRange).toBeAttached();
  87  | 
  88  |     // Test slider value modifications
  89  |     await sizeRange.fill('55');
  90  |     await expect(sizeRange).toHaveValue('55');
  91  | 
  92  |     await opacityRange.fill('85');
  93  |     await expect(opacityRange).toHaveValue('85');
  94  | 
  95  |     // Check export zip button
  96  |     const exportBtn = page.locator('[data-testid="recover-export-zip-btn"]');
  97  |     await expect(exportBtn).toBeAttached();
  98  |   });
  99  | 
  100 |   test('Scenario H: Error handling for invalid media uploads', async ({ page }) => {
  101 |     await page.goto('/remove');
  102 | 
  103 |     const fileInput = page.locator('[data-testid="remove-file-input"]').first();
  104 |     const invalidFilePath = path.resolve('test/fixtures/invalid.txt');
  105 | 
  106 |     await fileInput.setInputFiles(invalidFilePath);
  107 | 
  108 |     // Verify that the UI displays the invalid format modal
  109 |     const importModal = page.locator('[data-testid="import-plan-modal"]');
  110 |     await expect(importModal).toBeVisible();
  111 |     await expect(importModal).toContainText(/(MP4|MOV|PNG|upload|업로드)/i);
  112 | 
  113 |     // Verify can dismiss the warning modal
  114 |     const confirmBtn = page.locator('[data-testid="import-plan-confirm"]');
  115 |     await expect(confirmBtn).toBeVisible();
  116 |     await confirmBtn.click();
  117 |     await expect(importModal).toBeHidden();
  118 |   });
  119 | 
  120 | });
  121 | 
```