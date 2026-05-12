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

## 3. Launch Readiness Tests

1. **Landing Page CTA Navigation**
   - Action: Click "Start Cutting" on Landing Page.
   - Expected: Navigates to `/remove` Page.
   - Action: Click "Try Sample Project" on Landing Page.
   - Expected: Navigates to `/remove` Page and immediately loads sample frames.

2. **Prohibited Phrases Verification**
   - Action: Inspect Landing Page and Guide Page texts across KR, EN, and JP modes.
   - Expected: No occurrences of "100% free", "ad-free", "no ads", "unlimited", etc.

3. **Privacy & Policy Checks**
   - Action: View Privacy Policy.
 ## 4. Launch Hardening P0 Tests

1. **Privacy claim network inspection**
   - Action: Open Network tab, upload a video, apply key, export Sprite Sheet.
   - Expected: No requests to `/api/process-*` or any external backend endpoints. Everything is local to `blob:` or `localhost:3000`.

2. **production build dist key grep**
   - Action: Run `grep -R "GEMINI_API_KEY|AIza" dist || true`.
   - Expected: No matches in the production bundle.

3. `/api/process-*` production path 없음을 확인
   - Action: Inspect the loaded source code.
   - Expected: `fetch('/api/process-frames')` or similar API calls do not exist in the client chunk.

4. **1080p 300 frames & 720p 300 frames (Desktop)**
   - Action: Upload a ~10 sec 1080p video (30fps) on Desktop.
   - Expected: Passes the hard cap, triggers soft cap prompt, user can proceed. Video shouldn't crash.

5. **mobile 100 frames**
   - Action: Upload a ~3.5 sec video on an emulated Mobile device.
   - Expected: Passes soft cap, user confirms. Successful extraction without memory crash.

6. **hard cap 초과 영상 차단**
   - Action: Upload a 30-minute 4K video.
   - Expected: Immediate block by hard cap limits in `useMediaImport.ts` before extraction even starts. Clean exit.

7. **FFmpeg unavailable 상태 (Graceful Degrade)**
   - Action: Block `/ffmpeg-core.js` in network tab or simulate COEP failure.
   - Expected: WebM Export displays an error box "WebM is disabled due to environment security constraints". Sprite Sheet export remains fully functional.

8. **Transparent Video disabled but Sprite Sheet available**
   - Condition: FFmpeg failed to initialize.
   - Action: Click Sprite Sheet export.
   - Expected: Sprite Sheet works seamlessly and generates PNG + JSON correctly.

9. **AdSense script + COOP/COEP coexistence**
   - Condition: Live environment.
   - Expected: Either WebM works if headers are perfectly set, or WebM degrades gracefully without breaking the rest of the application including Google AdSense.

10. **Cross-browser Compatibility**
   - Action: Open BananaCut and test basic removal workflow.
   - Targets: Safari latest, Chrome latest, iPhone Safari, Android Chrome.
   - Expected: Functions core capabilities (Sprite Sheet / PNG generation). FFmpeg WebM might be unsupported on iOS Safari, which should fail gracefully via the FFmpegContext error handler.

## 6. Pre-Launch Configuration Checklist

1. **Static Files Check**
   - Expected: `/robots.txt` returns HTTP 200.
   - Expected: `/sitemap.xml` returns HTTP 200.
   - Expected: `/images/og-image.png` returns HTTP 200.
   - Expected: `/images/twitter-image.png` returns HTTP 200.

2. **Core Pages Return 200**
   - Expected: `/privacy` returns HTTP 200.
   - Expected: `/terms` returns HTTP 200.
   - Expected: `/guides` returns HTTP 200.
   - Expected: `/examples` returns HTTP 200.

3. **External Platform Integration**
   - Expected: AdSense script network status is OK (no CORB/CORS block due to headers).
   - Expected: `crossOriginIsolated` state matches environment capabilities.
   - Expected: If `Transparent Video` fails due to environment, `Sprite Sheet` remains functional.


## 8. Sample Release Gate

| Category | Requirement | Criteria |
| :--- | :--- | :--- |
| Sample Flow | Sample Project | Loads within 60s, generates usable assets |
| Export | Sample GIF Export | 0% failure |
| Export | GIF Failure -> ZIP | Graceful fallback |
| Export | Sprite Sheet | PNG + JSON Metadata valid |
| Network | No Media Upload | No background process or storage uploads |
| Release | Sample Gate | PASS only if all above pass |

- Browser:
- Device:
- Frame count:
- GIF export time:
- ZIP export time:
- Sprite Sheet export time:
- Errors:
- Fallback triggered (GIF->ZIP):
- Pass/Fail:
