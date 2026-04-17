const DEFAULT_IMAGE_QUALITY = 0.82;
const DEFAULT_MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const DEFAULT_MAX_FILE_BYTES = 500 * 1024;
const DEFAULT_MAX_OUTPUT_BYTES = 250 * 1024;

export interface InlineImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxInputBytes?: number;
  maxOutputBytes?: number;
  preferredMimeType?: "image/jpeg" | "image/webp" | "image/png";
}

export interface InlineFileOptions {
  maxInputBytes?: number;
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });
}

async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to load image."));
    });

    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function chooseMimeType(
  file: File,
  preferred?: InlineImageOptions["preferredMimeType"],
): string {
  if (preferred) return preferred;
  if (file.type === "image/png") return "image/png";
  if (file.type === "image/webp") return "image/webp";
  return "image/jpeg";
}

function clampDimensions(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  const scale = Math.min(1, maxWidth / width, maxHeight / height);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function estimateBytesFromDataUrl(dataUrl: string): number {
  if (!dataUrl) return 0;
  return Math.ceil((dataUrl.length * 3) / 4);
}

export async function compressImageToDataUrl(
  file: File,
  options: InlineImageOptions = {},
): Promise<string> {
  const maxInputBytes = options.maxInputBytes ?? DEFAULT_MAX_IMAGE_BYTES;
  if (file.size > maxInputBytes) {
    throw new Error(
      `Image is too large. Keep it under ${Math.round(maxInputBytes / 1024)}KB.`,
    );
  }

  const maxWidth = options.maxWidth ?? 1600;
  const maxHeight = options.maxHeight ?? 1600;
  const maxOutputBytes = options.maxOutputBytes ?? DEFAULT_MAX_OUTPUT_BYTES;
  const baseQuality = options.quality ?? DEFAULT_IMAGE_QUALITY;
  const mimeType = chooseMimeType(file, options.preferredMimeType);

  const img = await loadImageFromFile(file);
  let { width, height } = clampDimensions(
    img.naturalWidth || img.width,
    img.naturalHeight || img.height,
    maxWidth,
    maxHeight,
  );

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Image canvas is unavailable in this browser.");
  }

  for (let attempt = 0; attempt < 6; attempt += 1) {
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    const quality = Math.max(0.35, baseQuality * Math.pow(0.85, attempt));
    const dataUrl = canvas.toDataURL(mimeType, quality);
    if (estimateBytesFromDataUrl(dataUrl) <= maxOutputBytes || attempt === 5) {
      return dataUrl;
    }

    width = Math.max(1, Math.round(width * 0.85));
    height = Math.max(1, Math.round(height * 0.85));
  }

  throw new Error("Unable to compress image to a safe size.");
}

export async function prepareInlineImageDataUrl(
  file: File,
  options: InlineImageOptions = {},
): Promise<string> {
  if (!isImageFile(file)) {
    throw new Error("Please choose a valid image file.");
  }

  return await compressImageToDataUrl(file, options);
}

export async function prepareInlineFileDataUrl(
  file: File,
  options: InlineFileOptions = {},
): Promise<string> {
  const maxInputBytes = options.maxInputBytes ?? DEFAULT_MAX_FILE_BYTES;
  if (file.size > maxInputBytes) {
    throw new Error(
      `File is too large to store in Firestore. Keep it under ${Math.round(maxInputBytes / 1024)}KB or use an external file URL.`,
    );
  }

  return await readFileAsDataUrl(file);
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";
  return `${Math.round(bytes / 1024)}KB`;
}
