import multer from 'multer';

// Use in-memory buffer storage so files can be directly uploaded to Cloudflare R2 / Cloudinary
const storage = multer.memoryStorage();

export const uploadCV = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB maximum
  },
  fileFilter: (_req, file, cb) => {
    // Only accept PDF files for CV submissions
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF documents are permitted for CV upload.'));
    }
  },
});

export const uploadAvatarImage = multer({
  storage,
  limits: {
    fileSize: 8 * 1024 * 1024, // 8 MB maximum
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
    ];
    if (allowedMimes.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image type. Only JPEG, PNG, WEBP, and GIF images are permitted for profile avatars.'));
    }
  },
});

export const uploadFileOrImage = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB maximum
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/tiff',
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDFs and standard images (JPEG, PNG, WEBP, TIFF) are allowed.'));
    }
  },
});

export const uploadCourseMedia = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB maximum for topic videos and course assets
  },
  fileFilter: (_req, file, cb) => {
    const isImage = file.mimetype.startsWith('image/');
    const isVideo = file.mimetype.startsWith('video/');
    if (isImage || isVideo) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only videos (MP4, WEBM, MOV) or images (JPEG, PNG, WEBP) are permitted.'));
    }
  },
});

