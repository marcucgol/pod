const contractors = require('../config/contractors');
const createUpload = require('../middleware/createUpload');
const { readData, writeData } = require('../utils/dataStore');
const { buildStoredPath } = require('../utils/fileNames');

function getRecords(req, res) {
  const { contractorId } = req.query;
  const records = readData();

  if (contractorId) {
    return res.json(records.filter((record) => record.contractorId === contractorId));
  }

  res.json(records);
}

function createRecord(req, res) {
  const recordId = Date.now().toString();
  const upload = createUpload(recordId);

  upload(req, res, (err) => {
    if (err) {
      if (err && err.code === 'LIMIT_UNEXPECTED_FILE') {
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
    const files = (req.files || []).map((file) => buildStoredPath(recordId, file.filename));

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
}

module.exports = {
  getRecords,
  createRecord
};
