import {
  formatBytes,
  prepareInlineFileDataUrl,
  prepareInlineImageDataUrl,
} from "./media";

export interface UploadProgress {
  progress: number;
  error: string | null;
  downloadURL: string | null;
}

function normalizeInlinePath(path: string): string {
  return path.replace(/^\/+/, "").trim();
}

function reportProgress(
  onProgress?: (progress: number) => void,
  value = 100,
): void {
  onProgress?.(value);
}

export async function uploadImage(
  file: File,
  path: string,
  onProgress?: (progress: number) => void,
): Promise<{ url: string | null; error: string | null }> {
  try {
    normalizeInlinePath(path);
    reportProgress(onProgress, 10);
    const url = await prepareInlineImageDataUrl(file, {
      maxWidth: 1600,
      maxHeight: 1600,
      quality: 0.82,
      maxInputBytes: 5 * 1024 * 1024,
    });
    reportProgress(onProgress, 100);
    return { url, error: null };
  } catch (error: any) {
    return { url: null, error: error?.message || "Failed to prepare image." };
  }
}

export async function uploadFile(
  file: File,
  path: string,
  onProgress?: (progress: number) => void,
): Promise<{ url: string | null; error: string | null }> {
  try {
    normalizeInlinePath(path);
    reportProgress(onProgress, 10);
    const url = await prepareInlineFileDataUrl(file, {
      maxInputBytes: 300 * 1024,
    });
    reportProgress(onProgress, 100);
    return { url, error: null };
  } catch (error: any) {
    return { url: null, error: error?.message || "Failed to prepare file." };
  }
}

export async function deleteImage(
  urlOrPath: string,
): Promise<{ error: string | null }> {
  // Spark-plan friendly: we do not rely on remote Storage deletes.
  // Returning success keeps old call sites safe.
  void urlOrPath;
  return { error: null };
}

export { formatBytes };
