const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.resolve(process.env.UPLOAD_DIR || "./uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safe}`);
  },
});

const allowed = [".pdf", ".docx", ".txt", ".md"];

const upload = multer({
  storage,
  limits: {
    fileSize: (parseInt(process.env.MAX_UPLOAD_MB || "50", 10)) * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
      return cb(new Error(`Unsupported file type: ${ext}`));
    }
    cb(null, true);
  },
});

module.exports = upload;
