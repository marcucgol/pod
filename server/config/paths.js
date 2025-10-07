const fs = require('fs');
const path = require('path');

const { ROOT_DIR } = require('./env');

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

  const windowsBase = normalizeCandidate(process.env.WINDOWS_DATA_ROOT);
  const windowsDefault = windowsBase
    ? path.win32.join(windowsBase, 'ck', 'data.json')
    : path.win32.join('C:', 'Users', 'User', 'SK', 'ck', 'data.json');
  if (!candidates.includes(windowsDefault)) {
    candidates.push(windowsDefault);
  }

  const repositoryDefault = path.join(ROOT_DIR, 'data.json');
  if (!candidates.includes(repositoryDefault)) {
    candidates.push(repositoryDefault);
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
