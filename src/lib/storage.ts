import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "./firebase";

export interface UploadProgress {
  progress: number;
  error: string | null;
  downloadURL: string | null;
}

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

const ALLOWED_DOCUMENT_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function normalizeStoragePath(path: string): string {
  return path.replace(/^\/+/, "").trim();
}

function uploadFileInternal(
  file: File,
  path: string,
  allowedTypes: Set<string>,
  maxSizeBytes: number,
  onProgress?: (progress: number) => void,
): Promise<{ url: string | null; error: string | null }> {
  return new Promise((resolve) => {
    if (!file) {
      resolve({ url: null, error: "No file selected." });
      return;
    }

    if (!allowedTypes.has(file.type)) {
      resolve({
        url: null,
        error: "Unsupported file type.",
      });
      return;
    }

    if (file.size > maxSizeBytes) {
      resolve({ url: null, error: "File size is too large." });
      return;
    }

    const storagePath = normalizeStoragePath(path);
    if (!storagePath) {
      resolve({ url: null, error: "Invalid upload path." });
      return;
    }

    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(progress);
      },
      (error) => {
        resolve({ url: null, error: error.message });
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({ url: downloadURL, error: null });
        } catch (error: any) {
          resolve({ url: null, error: error.message });
        }
      },
    );
  });
}

export const uploadImage = (
  file: File,
  path: string,
  onProgress?: (progress: number) => void,
): Promise<{ url: string | null; error: string | null }> => {
  return uploadFileInternal(file, path, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES, onProgress);
};

export const uploadFile = (
  file: File,
  path: string,
  onProgress?: (progress: number) => void,
): Promise<{ url: string | null; error: string | null }> => {
  return uploadFileInternal(file, path, ALLOWED_DOCUMENT_TYPES, MAX_FILE_SIZE_BYTES, onProgress);
};

export const deleteImage = async (
  urlOrPath: string,
): Promise<{ error: string | null }> => {
  try {
    const imageRef = ref(storage, urlOrPath);
    await deleteObject(imageRef);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};
