export function getMediaLimits(isMobile: boolean) {
  return {
    hardFrames: isMobile ? 180 : 500,
    hardMemoryMB: isMobile ? 320 : 900,
    softFrames: isMobile ? 100 : 300,
    softMemoryMB: isMobile ? 180 : 512,
  };
}
