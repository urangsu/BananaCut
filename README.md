# BananaCut

BananaCut is a browser-based utility for extracting assets from videos. It allows developers and creators to remove solid backgrounds (like green screens or AI-generated flat backgrounds), clean up alpha edges, and export the results as transparent WebM videos or Sprite Sheets.

**Production BananaCut does not upload media files to a backend server.** 
All processing (frame extraction, chroma keying, and exporting) happens securely and locally within your web browser.

## Features & Workflow

1. **Remove:** Upload a video, pick a background color, and adjust tolerance to remove it.
2. **Recover:** Use brush and lasso tools to manually patch holes or remove stubborn artifacts on specific frames.
3. **Asset:** Export the processed frames for your project.

### Supported Input
- Any short video format supported by your modern browser (e.g., MP4, WebM).
- *Limits:* Geared toward short clips (under ~300 frames) due to browser memory limits. Heavy files will be blocked by import guards to prevent crashes.

### Supported Export
- **Sprite Sheet (PNG + JSON):** The recommended and most stable export path.
- **Zip (PNG Sequence):** For manual compositing.
- **Transparent Video (WebM):** Advanced export. Note: This relies on in-browser FFmpeg. If FFmpeg fails to load due to cross-origin isolation limits (COEP/COOP), this option degrades gracefully and is disabled, but Sprite Sheets will continue to work normally.

## Development

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

## Deployment Notes

- Because BananaCut relies on `SharedArrayBuffer` for FFmpeg (Transparent Video export), the server must provide `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` headers. 
- If deploying in an environment (like some ad networks or strict iFrames) where COEP breaks other scripts (e.g., Google AdSense), you may need to disable global COEP. In that case, WebM export will gracefully disable itself, while the core app and Sprite Sheet export remain fully functional.

## Privacy Note
The production version of BananaCut operates entirely client-side. The `experimental/backend` directory contains legacy scripts and is **not used in production**. No media files are ever uploaded to any server.

## Known Limits
- Memory exhaustion on mobile devices if the video is too long.
- High resolutions (4K) are generally downscaled or will crash the browser tab; keep clips short and small (720p/1080p).
