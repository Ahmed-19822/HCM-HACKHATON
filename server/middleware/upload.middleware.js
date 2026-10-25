import multer from 'multer';
import path from 'path';
import fs from 'fs';

const resolveUploadDir = () => {
  if (process.env.VERCEL) {
    return '/tmp/uploads';
  }

  if (process.env.UPLOAD_DIR) {
    return path.resolve(process.cwd(), process.env.UPLOAD_DIR);
  }

  return path.resolve(process.cwd(), 'uploads');
};

const uploadDir = resolveUploadDir();
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, unique);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) return cb(null, true);
  cb(new Error('Only image files are allowed'));
};

const maxSize = (Number(process.env.MAX_FILE_SIZE_MB) || 5) * 1024 * 1024;

const upload = multer({ storage, fileFilter, limits: { fileSize: maxSize } });

export default upload;
