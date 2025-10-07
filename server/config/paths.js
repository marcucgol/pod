const path = require('path');

const ROOT_DIR = path.join(__dirname, '..', '..');

function resolveDataFile() {
  const customPath = process.env.DATA_FILE_PATH;

  if (!customPath) {
    return path.join(ROOT_DIR, 'data.json');
  }

  if (path.isAbsolute(customPath) || path.win32.isAbsolute(customPath)) {
    return customPath;
  }

  return path.join(ROOT_DIR, customPath);
}

const DATA_FILE = resolveDataFile();
const UPLOADS_DIR = path.join(ROOT_DIR, 'uploads');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

module.exports = {
  ROOT_DIR,
  DATA_FILE,
  UPLOADS_DIR,
  PUBLIC_DIR
};
