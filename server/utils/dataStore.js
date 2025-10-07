const fs = require('fs');
const path = require('path');
const { DATA_FILE } = require('../config/paths');

function ensureDirectoryExists(filePath) {
  const directory = path.dirname(filePath);

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

function readData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    return [];
  }
}

function writeData(data) {
  ensureDirectoryExists(DATA_FILE);
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

module.exports = {
  readData,
  writeData
};
