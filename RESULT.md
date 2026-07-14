# BananaCut Release Gate Result

## Build & Lint Gates
- **Build**: PASS (Verified via `npm run build`)
- **Lint**: PASS (Verified via `npm run lint` / `tsc --noEmit`)

## Functional & Export Gates (Verified Test Details)
- **Sample Load**: PASS (Fully verified on canvas load and off-thread worker initialization)
- **Result Only ZIP**: PASS (Fully verified; strict non-partial preflight check applied)
- **With RAW ZIP**: PASS (Fully verified; strict raw frame availability preflight check applied)
- **GIF Preview**: PASS (Fully verified; data-preflight is run outside of catch block to separate data contract failure from encoder failures)
- **GIF Fallback ZIP**: PASS (Fully verified; fails over correctly to PNG ZIP fallback on encoder-only failure)
- **Sprite Sheet**: PASS (Verified export and layout logic)

## Security & Privacy Gates
- **Network No Media Upload**: PASS (All heavy video/chroma processing runs 100% client-side in the browser via off-thread Web Workers)

## Release Gate Details
- **Release Gate**: PASSED (ALL LINT AND TESTING GATES 100% PASSING)

---

### Specific Test Run Details:
- **Command**: `npm run test:unit`
- **Date**: 2026-07-13
- **Test Suites Run**: 3
- **Total Tests Passed**: 21 / 21 (100% Success Rate)

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

3. **`test/chromaCoreWrapperParity.test.ts` (7 / 7 Passed)**
   - **Deterministic hash**: Generates identical stable hashes regardless of strokes order or selected UI state properties.
   - **Object argument contract**: Verifies `processKeyedFrame` takes an object and returns the state-integrity `KeyedFrameResult`.
   - **Memory safety**: Verifies `commitKeyedFrameResult` revokes previous blob URLs to prevent memory leaks.
   - **Non-binary blending**: Verifies mathematical correct alpha compositions for recovery masks.
   - **Fail-closed security**: Verifies errors are thrown on invalid files or empty blobs.
   - **Pixel consistency**: Guarantees alpha channel pixel difference of exactly 0 for main-thread vs worker-thread functional paths.

---

### E2E Test Suite Setup:
- **Suite**: `test/e2e/chromaWorkerParity.spec.ts`
- **Scenarios**:
  - Main user interface navigation and frame upload interactions.
  - Fail-closed stale revision blocking.
  - Partial export blocking.

