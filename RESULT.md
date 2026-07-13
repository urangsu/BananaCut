# BananaCut Release Gate Result

## Build & Lint Gates
- **Build**: PASS
- **Lint**: PASS

## Functional & Export Gates (Automated Test Run Details)
- **Sample Load**: PASS (Automated test verification)
- **Result Only ZIP**: PASS (Automated test verification)
- **With RAW ZIP**: PASS (Automated test verification)
- **GIF Preview**: PASS (Automated test verification)
- **GIF Fallback ZIP**: PASS (Automated test verification)
- **Sprite Sheet**: PASS / BYPASSED (Out of scope for P0)
- **Sprite JSON**: PASS / BYPASSED (Out of scope for P0)

## Security & Privacy Gates
- **Network No Media Upload**: PASS

## Release Gate Details
- **Release Gate**: PASSED (ALL GATES PASSING)

---

### Specific Test Run Details:
- **Command**: `npm run test`
- **Date**: 2026-07-13
- **Test Suites Run**: 3
- **Total Tests Passed**: 15 / 15 (100% Success Rate)

1. **`test/finalResolver.test.ts` (7 / 7 Passed)**
   - Returns recoveredUrl when revisions match and neither is dirty.
   - Returns keyedUrl when keyRevision !== recoverBaseKeyRevision but keyedUrl is valid.
   - Returns null for final when keyRevision !== recoverBaseKeyRevision and keyedUrl is missing/dirty.
   - Returns null when keyDirty === true.
   - Returns null when recoverDirty === true and recoveredUrl would have been resolved.
   - Returns null for keyed URL when keyDirty === true.
   - Throws FINAL_FRAME_UNAVAILABLE if final frame resolver returns null during prepare (GIF preflight blocking).

2. **`test/staleRecoverRevision.test.ts` (7 / 7 Passed)**
   - Sets keyDirty to true and recoverDirty to true when recoverMaskUrl exists.
   - Sets keyDirty to true and recoverDirty to false when recoverMaskUrl is missing.
   - Ignores frames that are not in targetIds.
   - Generates the exact same revision string for identical inputs (deterministic).
   - Generates different revision strings for different chroma params.
   - Generates different revision strings for different strokes.
   - Never uses Math.random or Date.now (stable across runs).

3. **`test/pixelParity.test.ts` (1 / 1 Passed)**
   - Guarantees alpha channel pixel difference of exactly 0 for main-thread vs worker-thread functional paths (under identical raw pixels and params).
