const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { UPLOADS_DIR } = require('../config/paths');
const {
  decodeOriginalName,
  sanitizeFileName,
  isForbiddenExtension
} = require('../utils/fileNames');

function ensureUploadDir(recordId) {
  const directory = path.join(UPLOADS_DIR, recordId);
  fs.mkdirSync(directory, { recursive: true });
  return directory;
}

function createUpload(recordId) {
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      const dir = ensureUploadDir(recordId);
      cb(null, dir);
    },
    filename: (_req, file, cb) => {
      const decodedName = decodeOriginalName(file.originalname);
      const sanitized = sanitizeFileName(decodedName);
      cb(null, sanitized);
    }
  });

  return multer({
    storage,
    fileFilter: (_req, file, cb) => {
      const decodedName = decodeOriginalName(file.originalname);
      if (isForbiddenExtension(decodedName)) {
        return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'attachments'));
      }
      cb(null, true);
    }
  }).array('attachments');
}

module.exports = createUpload;
