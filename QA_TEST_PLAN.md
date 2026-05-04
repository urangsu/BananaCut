# Smart Crop QA Test Plan

## Test Cases

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
