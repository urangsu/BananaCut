import { StudioFrame } from '../StudioContext';

export async function generateSampleFrames(totalFrames: number = 16): Promise<StudioFrame[]> {
  const width = 400;
  const height = 400;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  const frames: StudioFrame[] = [];

  for (let i = 0; i < totalFrames; i++) {
    // Fill green screen background
    ctx.fillStyle = '#00FF00'; // Pure green for easy chroma keying
    ctx.fillRect(0, 0, width, height);

    // Bounce animation calculations
    const bounceProgress = (i % totalFrames) / totalFrames; // 0 to 1
    const yOffset = Math.sin(bounceProgress * Math.PI * 2) * 40; // -40 to 40
    
    // Draw simple character (yellow blob)
    const centerX = width / 2;
    const centerY = height / 2 + 50 + yOffset;
    const radiusX = 80 + Math.abs(yOffset) * 0.2; // Squish slightly when bouncing
    const radiusY = 80 - Math.abs(yOffset) * 0.2;
    
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#FFEB3B'; // Yellow
    ctx.fill();
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#F57F17'; // Darker yellow outline
    ctx.stroke();

    // Eyes
    ctx.beginPath();
    ctx.arc(centerX - 30, centerY - 20, 10, 0, Math.PI * 2);
    ctx.arc(centerX + 30, centerY - 20, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#000000';
    ctx.fill();

    // Mouth
    ctx.beginPath();
    ctx.arc(centerX, centerY + 20, 20, 0, Math.PI, false);
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#000000';
    ctx.stroke();

    // Arms
    ctx.beginPath();
    // Arm wiggle calculation
    const armWiggle = Math.cos(bounceProgress * Math.PI * 4) * 20;
    
    // Left arm
    ctx.moveTo(centerX - radiusX + 10, centerY);
    ctx.lineTo(centerX - radiusX - 40, centerY - 20 + armWiggle);
    
    // Right arm
    ctx.moveTo(centerX + radiusX - 10, centerY);
    ctx.lineTo(centerX + radiusX + 40, centerY - 20 - armWiggle);
    
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#F57F17';
    ctx.stroke();

    // Convert canvas to Blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error('Failed to create blob from canvas'));
      }, 'image/png');
    });

    const rawUrl = URL.createObjectURL(blob);
    
    frames.push({
      id: `sample_frame_${i}_${Date.now()}`,
      rawUrl,
      width,
      height,
      name: `sample_frame_${String(i).padStart(3, '0')}.png`,
      sourceIndex: i,
      dirty: true // Mark as dirty to force processing
    });
  }

  return frames;
}

export function revokeSampleFrames(frames: StudioFrame[]) {
  frames.forEach(frame => {
    if (frame.rawUrl && frame.rawUrl.startsWith('blob:')) {
      URL.revokeObjectURL(frame.rawUrl);
    }
    if (frame.processedUrl && frame.processedUrl.startsWith('blob:')) {
      URL.revokeObjectURL(frame.processedUrl);
    }
  });
}
