import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import ImageKit from 'imagekit';
import fs from 'fs';
import { upload } from '../middleware/upload.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Helper to check if ImageKit is configured via .env
const isImageKitConfigured = () => {
  return (
    Boolean(process.env.IMAGEKIT_PUBLIC_KEY) &&
    Boolean(process.env.IMAGEKIT_PRIVATE_KEY) &&
    Boolean(process.env.IMAGEKIT_URL_ENDPOINT)
  );
};

// Helper to check if Cloudinary is configured via .env
const isCloudinaryConfigured = () => {
  return (
    Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
    Boolean(process.env.CLOUDINARY_API_KEY) &&
    Boolean(process.env.CLOUDINARY_API_SECRET)
  );
};

// Initialize ImageKit instance
let imagekit = null;
if (isImageKitConfigured()) {
  imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
  });
}

// Initialize Cloudinary instance
if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded or file rejected by validator.',
      });
    }

    // 1. Priority 1: ImageKit Storage
    if (isImageKitConfigured() && imagekit) {
      try {
        const fileBuffer = fs.readFileSync(req.file.path);
        const uploadResult = await imagekit.upload({
          file: fileBuffer,
          fileName: req.file.filename,
          folder: '/kachra_bazar',
        });

        // Clean up temporary local file
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }

        return res.status(200).json({
          success: true,
          message: 'Image uploaded to ImageKit successfully.',
          url: uploadResult.url,
          fileId: uploadResult.fileId,
          size: uploadResult.size,
        });
      } catch (ikErr) {
        console.error('[ImageKit Upload Error]', ikErr);
        // Fallback to local file URL
        return res.status(200).json({
          success: true,
          message: 'Image stored locally (ImageKit upload failed).',
          url: `/uploads/${req.file.filename}`,
          filename: req.file.filename,
          size: req.file.size,
        });
      }
    }

    // 2. Priority 2: Cloudinary Storage
    if (isCloudinaryConfigured()) {
      try {
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
          folder: 'kachra_bazar',
          resource_type: 'auto',
        });

        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }

        return res.status(200).json({
          success: true,
          message: 'Image uploaded to Cloudinary successfully.',
          url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
          size: uploadResult.bytes,
        });
      } catch (cloudErr) {
        console.error('[Cloudinary Upload Error]', cloudErr);
        return res.status(200).json({
          success: true,
          message: 'Image stored locally (Cloudinary upload failed).',
          url: `/uploads/${req.file.filename}`,
          filename: req.file.filename,
          size: req.file.size,
        });
      }
    }

    // 3. Default: Local disk storage
    const url = `/uploads/${req.file.filename}`;
    return res.status(200).json({
      success: true,
      message: 'Image uploaded locally.',
      url,
      filename: req.file.filename,
      size: req.file.size,
    });
  } catch (err) {
    console.error('[Upload Error]', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to process image upload.',
      error: err.message,
    });
  }
});

export default router;
