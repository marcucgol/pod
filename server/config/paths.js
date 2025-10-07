const path = require('path');

const ROOT_DIR = path.join(__dirname, '..', '..');
const DATA_FILE = path.join(ROOT_DIR, 'data.json');
const UPLOADS_DIR = path.join(ROOT_DIR, 'uploads');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

module.exports = {
  ROOT_DIR,
  DATA_FILE,
  UPLOADS_DIR,
  PUBLIC_DIR
};
