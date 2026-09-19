import { Request, Response } from 'express';
import cloudinary from '../config/cloudinary';
import { Readable } from 'stream';

/**
 * Upload an image to Cloudinary and return the optimised URL.
 * The client MUST pre-optimise the image (max 2000 px, quality ≥ 85 %) before
 * calling this endpoint. Cloudinary will apply f_auto + q_auto on delivery.
 *
 * POST /api/upload
 * Body: multipart/form-data  { file: <image> }
 */
export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }

    // Upload from buffer using a readable stream → no tmp file on disk
    const uploadResult = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'instantmart',
            resource_type: 'image',
            // Let Cloudinary choose best format & compression on delivery
            fetch_format: 'auto',
            quality: 'auto',
            // Prevent upscaling – only downscale if > 2000 px (safety net)
            transformation: [
              { width: 2000, crop: 'limit' },
            ],
          },
          (error, result) => {
            if (error || !result) return reject(error || new Error('Upload failed'));
            resolve({ secure_url: result.secure_url, public_id: result.public_id });
          }
        );

        const readableStream = new Readable();
        readableStream.push(req.file!.buffer);
        readableStream.push(null);
        readableStream.pipe(uploadStream);
      }
    );

    // Build an explicit f_auto,q_auto delivery URL for the stored asset
    const deliveryUrl = cloudinary.url(uploadResult.public_id, {
      fetch_format: 'auto',
      quality: 'auto',
      secure: true,
    });

    return res.status(201).json({
      success: true,
      url: deliveryUrl,           // Use this URL to display the image
      rawUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    });
  } catch (error: any) {
    console.error('[uploadImage]', error);
    return res.status(500).json({ success: false, message: error.message || 'Upload failed' });
  }
};
