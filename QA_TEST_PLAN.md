
# BananaCut QA Test Plan

## Export Preflight Gate
Status: Planned / Not Implemented
1. All Frames Processed: 
   - Result Only ZIP -> Expected: Proceeds without preflight or info modal.
2. Some Dirty Frames:
   - Result Only ZIP -> Expected: Preflight modal with warning, requires confirmation.
3. Unprocessed Frames:
   - Result Only ZIP -> Expected: Preflight modal with error, cannot proceed.
4. GIF Preview:
   - Raw Fallback Case -> Expected: Warning, Proceedable.
5. Crop Box:
   - Missing CropBox (when recommended) -> Expected: Warning, Proceedable.
6. WebM:
   - Expected: Advanced warning, Proceedable.
