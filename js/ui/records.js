import elements from '../dom/elements.js';
import { fetchRecords } from '../api/client.js';
import { getActiveContractor } from '../state/session.js';

const columnConfig = [
  { key: 'number', title: '№' },
  { key: 'uko', title: 'УКО' },
  { key: 'contract', title: 'ДОГОВОР' },
  { key: 'purpose', title: 'НАЗНАЧЕНИЕ' },
  { key: 'year', title: 'СРОК' },
  { key: 'ks3', title: 'КС-3' },
  { key: 'eventName', title: 'МЕРОПРИЯТИЕ' },
  { key: 'address', title: 'АДРЕС' },
  {
    key: 'receivedAt',
    title: 'ДАТА ПОСТУПЛЕНИЯ',
    getValue: (record) => formatDateValue(record.checkDate, record.receivedAt)
  },
  { key: 'contractorName', title: 'ПОДРЯДЧИК' },
  { key: 'contractorCost', title: 'СТОИМОСТЬ ПОДРЯДЧИКА' },
  { key: 'skStatus', title: 'СТАТУС РАССМ. КС-2 (СК)' },
  { key: 'skNotes', title: 'ПРИМЕЧАНИЯ СК' },
  { key: 'dsrStatus', title: 'СТАТУС РАССМ. КС-2 (ДСР)' },
  { key: 'plannedCost', title: 'ПЛАНИРУЕМАЯ СТОИМОСТЬ С НДС, РУБ.' },
  {
    key: 'postCheckCost',
    title: 'СТОИМОСТЬ С НДС ВЫПОЛНЕНИЕ ПОСЛЕ ПРОВЕРКИ (РАЗНИЦА КОРРЕКТИРОВКИ), РУБ.'
  },
  {
    key: 'correctedCost',
    title: 'СТОИМОСТЬ С НДС ПОСЛЕ ПРОВЕРКИ КОРРЕКТИРУЕМАЯ (ПРИ НЕОБХОДИМОСТИ КОРРЕКТИРОВКИ), РУБ.'
  },
  { key: 'previousActCost', title: 'СТОИМОСТЬ С НДС РАНЕЕ ЗАКРЫТОГО АКТА, РУБ.' },
  { key: 'systems', title: 'СИСТЕМЫ' },
  {
    key: 'priceAcceptanceLevel',
    title: 'УРОВЕНЬ ЦЕН ПРИНЯТИЯ ВЫПОЛНЕНИЯ В СЛУЧАЕ ОТСТ. +ГГЭ'
  },
  { key: 'ggeSum', title: 'СУММА ГГЭ+ УР-НЬ ЦЕН' },
  { key: 'dsrNotes', title: 'ПРИМЕЧАНИЯ ДСР' },
  { key: 'assigneeName', title: 'ОТВЕТСТВЕННЫЙ' }
];

function formatDateValue(checkDate, receivedAt) {
  if (checkDate) {
    return checkDate;
  }

  if (!receivedAt) {
    return '';
  }

  try {
    const parsed = new Date(receivedAt);
    if (Number.isNaN(parsed.getTime())) {
      return receivedAt;
    }
    return parsed.toLocaleString('ru-RU');
  } catch (error) {
    return receivedAt;
  }
}

function createHeaderRow() {
  const headerRow = document.createElement('tr');
  columnConfig.forEach((column) => {
    const th = document.createElement('th');
    th.scope = 'col';
    th.textContent = column.title;
    headerRow.appendChild(th);
  });
  return headerRow;
}

function createBodyRow(record) {
  const row = document.createElement('tr');

  columnConfig.forEach((column) => {
    const td = document.createElement('td');
    const value = column.getValue
      ? column.getValue(record)
      : record[column.key];
    const hasValue = value !== undefined && value !== null && value !== '';
    td.textContent = hasValue ? value : '—';
    row.appendChild(td);
  });

  return row;
}

let lastRenderedSignature = null;
let isLoading = false;
let pollTimer = null;

function updateRenderedSignature(records) {
  try {
    lastRenderedSignature = JSON.stringify(records);
  } catch (error) {
    lastRenderedSignature = null;
  }
}

function recordsChanged(records) {
  if (!lastRenderedSignature) {
    return true;
  }

  try {
    return JSON.stringify(records) !== lastRenderedSignature;
  } catch (error) {
    return true;
  }
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
    updateRenderedSignature([]);
    return;
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'records-table-wrapper';

  const table = document.createElement('table');
  table.className = 'records-table';

  const thead = document.createElement('thead');
  thead.appendChild(createHeaderRow());

  const tbody = document.createElement('tbody');
  records.forEach((record) => {
    tbody.appendChild(createBodyRow(record));
  });

  table.append(thead, tbody);
  wrapper.appendChild(table);
  recordsContainer.appendChild(wrapper);
  updateRenderedSignature(records);
}

function renderRecordsError() {
  const { recordsContainer } = elements;
  if (!recordsContainer) return;

  recordsContainer.innerHTML = '';
  const errorEl = document.createElement('p');
  errorEl.className = 'error';
  errorEl.textContent = 'Не удалось загрузить формы. Попробуйте позже.';
  recordsContainer.appendChild(errorEl);
  lastRenderedSignature = null;
}

export async function loadRecords({ silent = false } = {}) {
  const contractor = getActiveContractor();
  if (!contractor) return;

  if (isLoading) {
    return;
  }

  isLoading = true;

  try {
    const records = await fetchRecords(contractor.id);
    if (recordsChanged(records)) {
      renderRecords(records);
    } else if (!silent && !lastRenderedSignature) {
      renderRecords(records);
    }
  } catch (error) {
    if (!silent) {
      renderRecordsError();
    }
  }

  isLoading = false;
}

export function clearRecords() {
  const { recordsContainer } = elements;
  if (recordsContainer) {
    recordsContainer.innerHTML = '';
  }
  lastRenderedSignature = null;
}

export function startRecordsAutoRefresh(interval = 5000) {
  if (pollTimer) {
    return;
  }

  pollTimer = setInterval(() => {
    loadRecords({ silent: true });
  }, interval);
}

export function stopRecordsAutoRefresh() {
  if (!pollTimer) {
    return;
  }

  clearInterval(pollTimer);
  pollTimer = null;
}
