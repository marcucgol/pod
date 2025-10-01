const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

function readData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

app.post('/records', (req, res) => {
  const recordId = Date.now().toString();
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(__dirname, 'uploads', recordId);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    }
  });

  const upload = multer({ storage }).array('attachments');

  upload(req, res, err => {
    if (err) return res.status(500).json({ error: 'Upload failed' });

    const records = readData();
    const checkDate = new Date().toLocaleString('ru-RU');
    const files = (req.files || []).map(f => path.join('uploads', recordId, f.originalname));
    const record = { id: recordId, ...req.body, files, checkDate };
    records.push(record);
    writeData(records);
    res.status(201).json({ success: true });
  });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
