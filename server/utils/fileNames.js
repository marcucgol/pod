const path = require('path');

function decodeOriginalName(name = '') {
  return Buffer.from(name, 'latin1').toString('utf8');
}

function sanitizeFileName(name = '') {
  return path.basename(name).replace(/[\\/:*?"<>|]/g, '_');
}

function isForbiddenExtension(name = '') {
  return path.extname(name).toLowerCase() === '.exe';
}

function buildStoredPath(recordId, fileName) {
  return path.posix.join('uploads', recordId, fileName);
}

module.exports = {
  decodeOriginalName,
  sanitizeFileName,
  isForbiddenExtension,
  buildStoredPath
};
