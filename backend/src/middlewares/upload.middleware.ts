import multer from 'multer';

// Use in-memory buffer storage so files can be directly uploaded to Cloudflare R2
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
