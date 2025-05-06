import { memoryStorage } from 'multer';

export const multerImageOptions = {
  storage: memoryStorage(),
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg'];
    cb(null, allowed.includes(file.mimetype));
  },
};

export const multerPdfOptions = {
  storage: memoryStorage(),
  fileFilter: (_req, file, cb) => {
    cb(null, file.mimetype === 'application/pdf');
  },
};
