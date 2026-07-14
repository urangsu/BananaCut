# BananaCut Test Fixtures

This directory contains synthetic and minimal media files used for running deterministic, automated E2E testing in headless environments.

## Available Fixtures

- **green-screen-2s.mp4**: A 2-second synthetic H.264 video at 10 FPS with a solid green-screen color `#00FF00`, 320x240 resolution. It has exactly 20 frames. Perfect for validating full-pipeline video extraction and chromakey transparency processing.
- **green-screen.png**: A single-frame PNG with a green-screen background for testing static keying.
- **mock-video.mp4**: A minimal mock video file container.
- **invalid.txt**: A text file with an `.mp4` extension or plain text file to verify invalid formats or import limits handling.
