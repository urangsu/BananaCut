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

## 2026-05-02: User Flow & Local FFmpeg WASM Regression Test
- Opened application as a fresh user (no python, no global installation required).
- Navigated to `/remove` route.
- FFmpeg context prewarned successfully in the background (`/ffmpeg/ffmpeg-core.wasm` loaded).
- Uploaded PNG sequence correctly, previewing image sequentially.
- Uploaded MP4 correctly.
- Background Network Tab verified that `/ffmpeg/ffmpeg-core.wasm` is serving from the same domain locally as primary source without fallback execution.
