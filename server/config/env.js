const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const ROOT_DIR = path.join(__dirname, '..', '..');
const envPath = path.join(ROOT_DIR, '.env');

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

module.exports = { ROOT_DIR };
