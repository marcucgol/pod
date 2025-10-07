const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..', '..');

function normalizeCandidate(candidatePath) {
  if (!candidatePath) {
    return null;
  }

  if (path.isAbsolute(candidatePath) || path.win32.isAbsolute(candidatePath)) {
    return candidatePath;
  }

  return path.join(ROOT_DIR, candidatePath);
}

function resolveDataFile() {
  const candidates = [];
  const customPath = normalizeCandidate(process.env.DATA_FILE_PATH);

  if (customPath) {
    candidates.push(customPath);
  }

  const repositoryDefault = path.join(ROOT_DIR, 'data.json');
  candidates.push(repositoryDefault);

  const windowsDefault = path.win32.join('C:', 'Users', 'User', 'SK', 'ck', 'data.json');
  if (!candidates.includes(windowsDefault)) {
    candidates.push(windowsDefault);
  }

  const existingFile = candidates.find((candidate) => {
    try {
      return fs.existsSync(candidate);
    } catch (error) {
      return false;
    }
  });

  return existingFile || candidates[0];
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
