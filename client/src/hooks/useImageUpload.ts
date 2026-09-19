/**
 * useImageUpload — Pre-optimises an image with HTML5 Canvas before uploading
 * to the backend /api/upload endpoint (which forwards to Cloudinary).
 *
 * Rules:
 *  - If width > 2 000 px → proportional resize to max 2 000 px (no crop, no distortion).
 *  - Quality: ≥ 85 % (0.85) – WebP preferred, JPEG fallback.
 *  - Returns the Cloudinary delivery URL with f_auto & q_auto baked in.
 */

import { useState, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';
const MAX_WIDTH = 2000;
const QUALITY = 0.85;

export interface UploadResult {
  url: string;       // Optimised Cloudinary delivery URL (use this for display)
  publicId: string;
}

export interface UseImageUploadReturn {
  uploadImage: (file: File) => Promise<UploadResult>;
  isUploading: boolean;
  progress: number;   // 0-100
  error: string | null;
  reset: () => void;
}

/**
 * Resize a File using an HTML5 Canvas without cropping.
 * Returns a Blob in WebP (with JPEG fallback).
 */
async function resizeImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Only downscale — never upscale
      if (width > MAX_WIDTH) {
        height = Math.round((height * MAX_WIDTH) / width);
        width = MAX_WIDTH;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas 2D context unavailable'));

      // Enable high-quality downscaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Try WebP first (smaller, lossless-friendly), fall back to JPEG
      const tryWebP = () =>
        new Promise<Blob | null>((res) => canvas.toBlob((b) => res(b), 'image/webp', QUALITY));

      tryWebP().then((blob) => {
        if (blob) return resolve(blob);
        // WebP not supported in this browser
        canvas.toBlob(
          (jpegBlob) => {
            if (jpegBlob) resolve(jpegBlob);
            else reject(new Error('Canvas toBlob failed'));
          },
          'image/jpeg',
          QUALITY
        );
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image for resizing'));
    };

    img.src = objectUrl;
  });
}

export function useImageUpload(): UseImageUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(0);
    setError(null);
  }, []);

  const uploadImage = useCallback(async (file: File): Promise<UploadResult> => {
    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      // ── Step 1: Canvas pre-optimisation (10-40 % of progress) ─────────────
      setProgress(10);
      const optimisedBlob = await resizeImage(file);
      setProgress(40);

      // ── Step 2: Build FormData ─────────────────────────────────────────────
      const ext = optimisedBlob.type === 'image/webp' ? 'webp' : 'jpg';
      const optimisedFile = new File(
        [optimisedBlob],
        file.name.replace(/\.[^.]+$/, `.${ext}`),
        { type: optimisedBlob.type }
      );

      const formData = new FormData();
      formData.append('file', optimisedFile);
      setProgress(50);

      // ── Step 3: Upload to backend (50-95 % of progress) ───────────────────
      const xhr = new XMLHttpRequest();
      const uploadPromise = new Promise<UploadResult>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const pct = 50 + Math.round((e.loaded / e.total) * 45);
            setProgress(pct);
          }
        });

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText);
            if (data.success) {
              resolve({ url: data.url, publicId: data.publicId });
            } else {
              reject(new Error(data.message || 'Upload failed'));
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.open('POST', `${API_BASE}/api/upload`);
        xhr.withCredentials = true; // send HttpOnly auth cookie
        xhr.send(formData);
      });

      const result = await uploadPromise;
      setProgress(100);
      return result;
    } catch (err: any) {
      const msg = err?.message || 'Image upload failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsUploading(false);
    }
  }, []);

  return { uploadImage, isUploading, progress, error, reset };
}
