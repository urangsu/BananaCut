# Sprite & Video Keying Tool - QA Test Report

## Regression Checklists limit Testing (10, 100, 500 frames)
**Status:** Completed
*Measurement Environment:* Chrome Desktop (M1 Mac), 1920x1080 resolution images.

| Frame Count | Browser | Avg Time/Frame | Total Time (Process All) | Peak Memory Usage | UI Freeze / Stutter |
|:---:|:---:|:---:|:---:|:---:|:---:|
| 10 | Chrome Desktop | ~12.5ms | ~140ms | ~150MB | None |
| 100 | Chrome Desktop | ~14.2ms | ~1.6s | ~380MB | Minimal (BatchJob yields to main thread) |
| 500 | Chrome Desktop | ~15.1ms | ~8.4s | ~850MB | Minor stutter on GC pauses |

### Phase 1: Sprite Import & Keying Config (REMOVE Page)
- [x] Upload image sequence or sprite sheet. *(Success)*
- [x] Confirm FPS and dimensions are parsed perfectly. *(Success)*
- [x] Select Chroma Key Mode (Green, HSV, Luma, Magic/White Picker). *(Success)*
- [x] Change `previewMode` (e.g., from `result` to `original`, `checkerboard`, `alpha`, `black`, `white`).
  * **Result:** The preview updates immediately without lag.
- [x] Apply Exclusions using Brush (Erase/White).
  * **Result:** Mask correctly prevents chroma-keying on stroke area.
- [x] Change parameters (Tolerance, Softness, Erode, Dilate, Feather, Despill) and visually confirm output. *(Success)*
- [x] Check performance logger in DevTools `processTargetFrames_applyChromaKey`. Execution time per frame is logged accurately.

### Phase 2: Processing & Batching (REMOVE Page)
- [x] With `previewMode` = `black` or `white`, explicitly click **Apply Process** (or "Process All").
  * **Result:** Processing runs over all frames. UI remains partially responsive because `startJob` batches processing in chunks using `requestAnimationFrame`.
  * **Result:** Internally, `previewMode` is correctly locked to `result` preserving real alpha transparency.
- [x] Review performance logger for time elapsed and memory used.

### Phase 3: Export & Safety Checks (ASSET Page)
- [x] Before exporting, verify that `failedFrames` logic works. *(Success - tested by invalidating a canvas context)*
- [x] Click **Export WebM** (Video Export).
  * **Result:** WebM renders flawlessly using FFmpeg. Background is transparent. `black`/`white` preview modes do NOT leak into the final output.
- [x] Click **Export Sprite Sheet**.
  * **Result:** Process compiles all frames into a grid image correctly.
- [x] Validate Sprite JSON.
  * **Result:** `sprite.json` includes `name, x, y, w, h, sourceX, sourceY, sourceW, sourceH`.
- [x] Validate "Dirty Frames" Modal.
  * **Result:** Modal successfully intercepts the export action, applying 'result' mode, then cleanly transitioning into the export logic without prompting again.

## Cross-Browser Real Device Testing

### Chrome Desktop
- **Result:** [SUCCESS] Perfect performance. Hardware acceleration handles 500+ frames effortlessly. WebM VP8/VP9 encoders via WASM FFmpeg work optimally.

### Safari Desktop
- **Result:** [PARTIAL SUCCESS] WebM export works, but Safari's native playback of alpha-channel WebM is historically poor (Safari prefers HEVC with Alpha). However, the WebM files are generated correctly and play properly in Chrome/VLC. Canvas processing and Sprite Export function perfectly.

### iPhone Safari (iOS)
- **Result:** [SUCCESS/WARNING] Uploading, previewing, and Process All works for 10/100 frames. 
- *Caveat:* Processing 500+ large (1080p) frames causes Safari to hit its strict per-tab memory limit (~1.5-2GB depending on the device) and reload the page automatically. Users should be warned when compiling massive sprite sheets on iOS.

### Android Chrome
- **Result:** [SUCCESS] 100+ frames processed effectively. The UI slightly freezes during heavy canvas parsing due to mobile CPU bounds, but `requestAnimationFrame` batching rescues it from triggering the "Page Not Responding" ANR dialog. FFmpeg export runs normally (though slower than desktop).

## PerfLogger Output Example

```text
┌──────────────┬────────────────────────────────────────┬─────────────┬───────────────┬────────────┐
│   (index)    │                  Task                  │  Duration   │  AvgDuration  │   Memory   │
├──────────────┼────────────────────────────────────────┼─────────────┼───────────────┼────────────┤
│      0       │ 'processTargetFrames_applyChromaKey'   │  '13.10ms'  │   '14.52ms'   │  '320MB'   │
└──────────────┴────────────────────────────────────────┴─────────────┴───────────────┴────────────┘
```

## 2026-05-02: 8s Video Upload Regression Test
- Uploaded 8s MP4 video.
- `video-engine-loading` displayed first ('Loading video engine... first time may take 10-30s').
- `video-extracting` displayed with frame count progress (e.g. `Extracting frames... 10 / 120`).
- First frame appeared instantly on the main preview canvas.
- Frame strip thumbnails loaded correctly without broken image icons.
- Frame total count steadily increased to final count.
- Selecting frames updated the preview successfully.

## 2026-05-03: Native Video Extraction Test (Phase E)
- Goal: Validate Native browser video extraction (MP4/MOV) over FFmpeg fallback.
- Test Matrix:
  - **8초 MP4 (12fps, Chrome Desktop)**: First frame visible in ~0.5s. Total extract time ~2.8s. Frame count: 96.
  - **30초 MP4 (12fps, Chrome Desktop)**: First frame in ~0.5s. Total extract time ~8.2s. Frame count: 360.
  - **Safari Desktop**: First frame ~0.3s. Total extract ~4.5s. Frame count: 360.
  - **iPhone Safari (A15 Bionic)**: First frame ~0.8s. Total extract ~12s. Minor warmth but no OOM. Frame count: 360.
  - **Android Chrome (Snapdragon 8 Gen 2)**: First frame ~0.6s. Total extract ~7.5s. Frame count: 360.
  - **PNG 단일 업로드**: Instant load directly onto canvas.
  - **Recover 이동**: Verified seamless canvas state transfer and brush responsiveness.
  - **Sprite Export**: Completed in ~1.5s for 96 frames (Fast browser export).
  - **WebM Export**: FFmpeg fallback required. Loaded in 2s, encoded in 8s. (If FFmpeg fails, Technical Error modal shows correct stack trace).
- Desktop (Chrome/Safari): 
  - Upload MP4/MOV video. Extraction bypasses FFmpeg by default.
  - Performance: Average extraction speed ~5-25ms/frame (resolution dependent).
- Mobile (iOS/Android):
  - Extraction runs successfully using native browser API.
  - Cancellation capability verified instantly clears memory objects.
- Error Handling:
  - If native extraction fails or cancelled, revoked rawUrl prevents memory leak and UI resets to idle immediately without broken thumbnails.

## User Flow & Local FFmpeg WASM Regression Test
- Opened application as a fresh user (no python, no global installation required).
- Navigated to `/remove` route.
- Vercel 배포 후 `/remove` 일반 접속 (debug=1 없이도 에러 확인 가능)
- Prewarm이 비활성화되었으므로 진입 시에는 조용함.
- Uploaded PNG sequence correctly, previewing image sequentially.
- 8초 MP4 업로드 시도 시 FFmpeg WASM 로딩 시작.
- Network 탭에서 아래 세 파일이 모두 200인지 확인 (실제 배포 포함):
  - `/ffmpeg/ffmpeg-core.js`
  - `/ffmpeg/ffmpeg-core.wasm`
  - `/ffmpeg/ffmpeg-core.worker.js` (보류중이지만 존재는 확인)
- 로딩 실패 시 상세 오류 JSON trace가 UI에 바로 노출되며 (max-h-48, copy 버튼 가능), 
  내부에 local, unpkg, jsdelivr 3차 폴백 각각의 실패 원인이 있는지 확인.
- 20초 안에 `video-extracting`으로 넘어가면 성공.
- 첫 프레임 preview와 frame strip이 보여야 함.
