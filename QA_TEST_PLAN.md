# BananaCut QA Test Plan

## 1. Smart Crop Tests

1. **Dirty frame confirm 취소**
   - Condition: Dirty frames exist.
   - Action: Click "Analyze Margins".
   - Expected: Confirm dialog appears. Click "Cancel".
   - Result: Crop analysis should not start.

2. **Dirty frame confirm 승인**
   - Condition: Dirty frames exist.
   - Action: Click "Analyze Margins".
   - Expected: Confirm dialog appears. Click "OK".
   - Result: Processing should start, then crop analysis should run on the updated frames.

3. **Partial failure**
   - Condition: Trigger a situation where frame processing fails (e.g., corrupt source image).
   - Action: Click "Analyze Margins".
   - Expected: System processes frames, some fail.
   - Result: Analysis should abort and alert user with specific failed frame indices.

4. **Crop preview 중 brush/picker 차단**
   - Condition: Crop analysis complete, "Preview Box" is active.
   - Action: Try to use Brush or Color Picker.
   - Expected: They should be disabled while "Preview Box" is checked.
   - Result: Brush/Picker should not function.

## 2. Sample Project Tests

1. **Try Sample Project (RemovePage)**
   - Condition: Initial load (no frames).
   - Action: Click "Try Sample Project" under the upload box.
   - Expected/Result: 16 sample frames (animated bouncing character on green screen) are generated and loaded.
   - Verify: Preview animates, keying works, brush exclusion works.
   - Verify: Segments are initialized to "idle_sitting".
   - Verify: Download modes (Result Only, With RAW, GIF) generate complete assets.
   - Verify: Check tracking events (`Try_Sample_Project`, `Sample_Project_Loaded`).

2. **Try Sample Project (AssetPage)**
   - Condition: No frames loaded.
   - Action: Go to Asset tab, click "Try Sample Project".
   - Expected/Result: Sample frames load, segments and character name populate.
   - Verify: Can immediately perform "Analyze Margins" and "Export Sprite Sheet".

3. **Revocation Check**
   - Condition: Sample project already loaded.
   - Action: Click "Try Sample Project" again.
   - Expected/Result: Previous sample frames are removed (revokeObjectURL called), new random frames generated. No memory leak.

