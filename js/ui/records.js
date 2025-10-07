import elements from '../dom/elements.js';
import { fetchRecords } from '../api/client.js';
import { getActiveContractor } from '../state/session.js';

function createDetail(label, value) {
  if (!value) {
    return null;
  }

  const dt = document.createElement('dt');
  dt.textContent = label;
  const dd = document.createElement('dd');
  dd.textContent = value;
  return [dt, dd];
}

export function renderRecords(records) {
  const { recordsContainer } = elements;
  if (!recordsContainer) return;

  recordsContainer.innerHTML = '';

  if (!records || records.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'Нет отправленных форм';
    recordsContainer.appendChild(empty);
    return;
  }

  records.forEach((record) => {
    const card = document.createElement('article');
    card.className = 'record-card';

    const title = document.createElement('h2');
    title.textContent = `№ ${record.number || '-'} — ${record.contract || '-'}`;

    const meta = document.createElement('p');
    meta.className = 'record-meta';
    meta.textContent = `Проверено: ${record.checkDate || '—'}`;

    const list = document.createElement('dl');
    list.className = 'record-details';

    const detailMap = [
      ['УКО', record.uko],
      ['Назначение', record.purpose],
      ['Дата', record.year],
      ['КС-3', record.ks3],
      ['Мероприятие', record.eventName],
      ['Адрес', record.address],
      ['Стоимость с НДС', record.contractorCost]
    ];

    detailMap.forEach(([label, value]) => {
      const detail = createDetail(label, value);
      if (!detail) return;
      list.append(detail[0], detail[1]);
    });

    card.append(title, meta, list);

    const files = Array.isArray(record.files) ? record.files : [];
    if (files.length > 0) {
      const filesTitle = document.createElement('h3');
      filesTitle.textContent = 'Файлы';
      const fileList = document.createElement('ul');
      fileList.className = 'record-files';

      files.forEach((filePath) => {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = filePath;
        const fileNamePart = filePath.split('/').pop() || '';
        let fileName = fileNamePart;
        try {
          fileName = decodeURIComponent(fileNamePart);
        } catch (error) {
          fileName = fileNamePart;
        }
        link.textContent = fileName;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        item.appendChild(link);
        fileList.appendChild(item);
      });

      card.append(filesTitle, fileList);
    }

    recordsContainer.appendChild(card);
  });
}

function renderRecordsError() {
  const { recordsContainer } = elements;
  if (!recordsContainer) return;

  recordsContainer.innerHTML = '';
  const errorEl = document.createElement('p');
  errorEl.className = 'error';
  errorEl.textContent = 'Не удалось загрузить формы. Попробуйте позже.';
  recordsContainer.appendChild(errorEl);
}

export async function loadRecords() {
  const contractor = getActiveContractor();
  if (!contractor) return;

  try {
    const records = await fetchRecords(contractor.id);
    renderRecords(records);
  } catch (error) {
    renderRecordsError();
  }
}

export function clearRecords() {
  renderRecords([]);
}
