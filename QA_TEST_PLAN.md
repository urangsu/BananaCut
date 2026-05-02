# Sprite & Video Keying Tool - QA Test Plan

## Regression Checklists limit Testing (10, 100, 500 frames)
Perform all checks for a file containing 10 frames, 100 frames, and 500 frames. Note the difference in memory utilization in the dev console's `PerfLogger` output.

### Phase 1: Sprite Import & Keying Config (REMOVE Page)
- [ ] Upload image sequence or sprite sheet.
- [ ] Confirm FPS and dimensions are parsed perfectly.
- [ ] Select Chroma Key Mode (Green, HSV, Luma, Magic/White Picker).
- [ ] Change `previewMode` (e.g., from `result` to `original`, `checkerboard`, `alpha`, `black`, `white`).
  * **Expected:** The preview updates immediately.
- [ ] Apply Exclusions using Brush (Erase/White).
  * **Expected:** Mask prevents chroma-keying for the stroke area or forces removal.
- [ ] Change parameters (Tolerance, Softness, Erode, Dilate, Feather, Despill) and visually confirm output.
- [ ] Check performance logger in DevTools `processTargetFrames_applyChromaKey`. Execution time per frame should remain manageable based on image size.

### Phase 2: Processing & Batching (REMOVE Page)
- [ ] With `previewMode` = `black` or `white`, explicitly click **Apply Process** (or "Process All").
  * **Expected:** Processing runs over all frames without blocking the UI completely. Frame count displays correct processing progress.
  * **Expected:** Internally, `previewMode` must be locked to `result` so transparency is preserved for export, rather than hard-coding green/black pixels.
- [ ] Review performance logger to see the time elapsed and memory used for the full operation. 

### Phase 3: Export & Safety Checks (ASSET Page)
- [ ] Before exporting, verify that `failedFrames` logic works (e.g. if one canvas conversion fails, it handles partial success and halts export silently or displays errors).
- [ ] Click **Export WebM** (Video Export).
  * **Expected:** WebM renders flawlessly using FFmpeg. Video background must be transparent or as configured by encoder, with NO baked `black`/`white` from the dev's preview mode.
- [ ] Click **Export Sprite Sheet**.
  * **Expected:** Process begins compiling all frames into a grid.
- [ ] Validate Sprite JSON:
  * Check the `metadata.json` / `sprite.json` includes `name, x, y, w, h`, and the newly strongly typed `sourceX, sourceY, sourceW, sourceH`.
- [ ] Validate "Dirty Frames" Modal:
  * Upload new sequence, go to ASSET page instantly WITHOUT running "Apply Process" in Remove tab.
  * Click export.
  * **Expected:** Modal appears: "There are unprocessed (dirty) frames".
  * Click **Process & Continue**. 
  * **Expected:** Batch job processes frames and *automatically* launches the export sequence immediately after without any manual second clicks.

## Memory Tracking
Watch `PerfLogger.end()` output format in the console specifically:
- `Task: AssetPage_applyChromaKeyAdvanced` / `processTargetFrames_applyChromaKey`
- `AvgDuration:` should remain stable across early and late frames.
- `Memory:` verify that no memory leaks occur beyond standard browser GC windows (should not skyrocket to 4GB+).
