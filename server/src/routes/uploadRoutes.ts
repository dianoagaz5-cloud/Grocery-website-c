import { Router } from 'express';
import multer from 'multer';
import { uploadImage } from '../controllers/uploadController';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';

const router = Router();

// Store file in memory — no tmp files, direct stream to Cloudinary
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB hard limit (client already pre-shrinks to <2 MB)
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are accepted'));
    }
  },
});

// Only authenticated admins can upload product images
router.post(
  '/',
  authMiddleware as any,
  adminMiddleware as any,
  upload.single('file'),
  uploadImage as any
);

export default router;
