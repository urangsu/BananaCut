/**
 * Fetches a Blob from a given URL and performs strict PNG validation checks:
 * 1. Confirms the response status is OK (response.ok === true)
 * 2. Confirms the Blob is non-empty (blob.size > 0)
 * 3. Verifies the 8-byte PNG signature header (PNG magic bytes)
 */
export async function fetchPngBlobStrict(url: string): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP_FETCH_FAILED:${response.status}:${url}`);
  }
  
  const blob = await response.blob();
  if (!blob || blob.size === 0) {
    throw new Error(`ZERO_SIZE_BLOB:${url}`);
  }

  // PNG magic bytes signature check: [137, 80, 78, 71, 13, 10, 26, 10]
  const buffer = await blob.slice(0, 8).arrayBuffer();
  const arr = new Uint8Array(buffer);
  const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10];
  
  let isValidPng = arr.length >= 8;
  for (let i = 0; i < 8; i++) {
    if (arr[i] !== pngSignature[i]) {
      isValidPng = false;
      break;
    }
  }

  if (!isValidPng) {
    throw new Error(`INVALID_PNG_SIGNATURE:${url}`);
  }

  return blob;
}

/**
 * Fetches a Blob from a given URL and performs strict raw image (PNG or JPEG) validation checks:
 * 1. Confirms the response status is OK (response.ok === true)
 * 2. Confirms the Blob is non-empty (blob.size > 0)
 * 3. Verifies the 8-byte PNG or 3-byte JPEG signature header
 * 4. Confirms the MIME type is image/png or image/jpeg
 */
export async function fetchRawImageBlobStrict(url: string): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP_FETCH_FAILED:${response.status}:${url}`);
  }
  
  const blob = await response.blob();
  if (!blob || blob.size === 0) {
    throw new Error(`ZERO_SIZE_BLOB:${url}`);
  }

  // Read first 8 bytes to verify PNG or JPEG
  const buffer = await blob.slice(0, 8).arrayBuffer();
  const arr = new Uint8Array(buffer);

  const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10];
  let isPng = arr.length >= 8;
  for (let i = 0; i < 8; i++) {
    if (arr[i] !== pngSignature[i]) {
      isPng = false;
      break;
    }
  }

  // JPEG starts with FF D8 FF
  const isJpeg = arr.length >= 3 && arr[0] === 0xFF && arr[1] === 0xD8 && arr[2] === 0xFF;

  if (!isPng && !isJpeg) {
    throw new Error(`INVALID_RAW_IMAGE_SIGNATURE:${url}`);
  }

  const mime = blob.type;
  if (mime && mime !== 'image/png' && mime !== 'image/jpeg') {
    throw new Error(`INVALID_MIME_TYPE:${mime}:${url}`);
  }

  return blob;
}
