const express = require('express');
const fs = require('fs');
const authRoutes = require('./routes/authRoutes');
const recordRoutes = require('./routes/recordRoutes');
const { PUBLIC_DIR, ROOT_DIR, UPLOADS_DIR } = require('./config/paths');

const app = express();

app.use(express.json());

if (fs.existsSync(PUBLIC_DIR)) {
  app.use(express.static(PUBLIC_DIR));
}

app.use(express.static(ROOT_DIR));
fs.mkdirSync(UPLOADS_DIR, { recursive: true });
app.use('/uploads', express.static(UPLOADS_DIR));

app.use(authRoutes);
app.use(recordRoutes);

module.exports = app;
