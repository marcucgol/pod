const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const DATA_FILE = path.join(__dirname, 'data.json');

const contractors = [
  {
    id: 'rogaikopyta',
    name: 'Рога и Копыта',
    login: 'rogaikopyta',
    password: 'qwerty123'
  }
];

app.use(express.json());
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
}
app.use(express.static(__dirname));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/contractors', (_req, res) => {
  res.json(
    contractors.map(({ id, name, login, password }) => ({
      id,
      name,
      login,
      password
    }))
  );
});

app.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  const contractor = contractors.find(
    (item) => item.login === username && item.password === password
  );

  if (!contractor) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  res.json({
    success: true,
    contractor: {
      id: contractor.id,
      name: contractor.name,
      login: contractor.login
    }
  });
});

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

app.get('/records', (req, res) => {
  const { contractorId } = req.query;
  const records = readData();

  if (contractorId) {
    return res.json(records.filter((record) => record.contractorId === contractorId));
  }

  res.json(records);
});

app.post('/records', (req, res) => {
  const recordId = Date.now().toString();

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      const dir = path.join(__dirname, 'uploads', recordId);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (_req, file, cb) => {
      const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
      const sanitized = path.basename(originalName).replace(/[\\/:*?"<>|]/g, '_');
      cb(null, sanitized);
    }
  });

  const upload = multer({
    storage,
    fileFilter: (_req, file, cb) => {
      const decodedName = Buffer.from(file.originalname || '', 'latin1').toString('utf8');
      const extension = path.extname(decodedName).toLowerCase();
      if (extension === '.exe') {
        return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'attachments'));
      }
      cb(null, true);
    }
  }).array('attachments');

  upload(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ error: 'Загрузка файлов .exe запрещена' });
      }
      return res.status(500).json({ error: 'Upload failed' });
    }

    const { contractorId } = req.body || {};
    if (!contractorId) {
      return res.status(400).json({ error: 'Не указан подрядчик' });
    }

    const contractor = contractors.find((item) => item.id === contractorId);
    if (!contractor) {
      return res.status(400).json({ error: 'Неизвестный подрядчик' });
    }

    const records = readData();
    const checkDate = new Date().toLocaleString('ru-RU');
    const files = (req.files || []).map((f) => path.posix.join('uploads', recordId, f.filename));

    const record = {
      id: recordId,
      ...req.body,
      contractorId,
      contractorName: contractor.name,
      files,
      checkDate
    };

    records.push(record);
    writeData(records);
    res.status(201).json({ success: true, record });
  });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
