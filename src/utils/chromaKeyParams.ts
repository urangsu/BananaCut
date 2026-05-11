export interface ChromaKeyParams {
  keyingMode: 'rgb' | 'hsv' | 'luma' | 'greenAdvanced';
  previewMode: 'result' | 'original' | 'alpha' | 'checkerboard' | 'black' | 'white';
  tolerance: number;
  softness: number;
  enclosedTolerance: number;
  chromaKeyColor: 'White' | 'Green' | 'Picker';
  pickedColor: { r: number, g: number, b: number };
  despill: number;
  erode: number;
  dilate: number;
  feather: number;
  alphaContrast: number;
}

export const normalizeChromaKeyParams = (params: Partial<ChromaKeyParams>): ChromaKeyParams => {
  const clamp = (val: number, min: number, max: number) => {
    if (isNaN(val)) return min;
    return Math.max(min, Math.min(max, val));
  };
  
  return {
    keyingMode: ['rgb', 'hsv', 'luma', 'greenAdvanced'].includes(params.keyingMode as string) ? params.keyingMode as any : 'greenAdvanced',
    previewMode: ['result', 'original', 'alpha', 'checkerboard', 'black', 'white'].includes(params.previewMode as string) ? params.previewMode as any : 'result',
    tolerance: clamp(Number(params.tolerance || 0), 0, 100),
    softness: clamp(Number(params.softness || 0), 0, 100),
    enclosedTolerance: clamp(Number(params.enclosedTolerance || 0), 0, 100),
    chromaKeyColor: ['White', 'Green', 'Picker'].includes(params.chromaKeyColor as string) ? params.chromaKeyColor as any : 'Green',
    pickedColor: params.pickedColor && typeof params.pickedColor.r === 'number' ? params.pickedColor : { r: 0, g: 255, b: 0 },
    despill: clamp(Number(params.despill || 0), 0, 100),
    erode: clamp(Number(params.erode || 0), 0, 100),
    dilate: clamp(Number(params.dilate || 0), 0, 100),
    feather: clamp(Number(params.feather || 0), 0, 100),
    alphaContrast: clamp(Number(params.alphaContrast || 0), -100, 100),
  };
};
