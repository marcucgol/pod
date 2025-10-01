const modal = document.getElementById('successModal');
const nextBtn = document.getElementById('nextBtn');
const app = document.getElementById('app');
const loginScreen = document.getElementById('loginScreen');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const recordStringEl = document.getElementById('recordString');
const companyNameEl = document.getElementById('companyName');
const numberInput = document.getElementById('number');
const loginUsernameInput = document.getElementById('loginUsername');
const loginPasswordInput = document.getElementById('loginPassword');
const tabButtons = document.querySelectorAll('.tab-button');
const tabPanels = document.querySelectorAll('.tab-panel');
const recordsContainer = document.getElementById('recordsContainer');
const formError = document.getElementById('formError');
const dropZone = document.getElementById('dropZone');
const dropZoneText = document.getElementById('dropZoneText');
const fileInput = document.getElementById('attachments');
const yearInput = document.getElementById('year');
const dataForm = document.getElementById('dataForm');

const defaultLoginErrorMessage = loginError ? loginError.textContent : '';
let activeContractor = null;

function setActiveTab(targetId) {
  tabButtons.forEach((button) => {
    const isActive = button.dataset.target === targetId;
    button.classList.toggle('active', isActive);
  });

  tabPanels.forEach((panel) => {
    const isActive = panel.id === targetId;
    panel.classList.toggle('hidden', !isActive);
  });
}

tabButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setActiveTab(button.dataset.target);
    if (button.dataset.target === 'recordsTab') {
      loadRecords();
    }
  });
});

function showFormError(message) {
  if (!formError) return;
  formError.textContent = message;
  formError.classList.toggle('hidden', !message);
}

function renderRecords(records) {
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
      if (!value) return;
      const dt = document.createElement('dt');
      dt.textContent = label;
      const dd = document.createElement('dd');
      dd.textContent = value;
      list.append(dt, dd);
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

async function loadRecords() {
  if (!activeContractor || !recordsContainer) return;

  try {
    const response = await fetch(`/records?contractorId=${encodeURIComponent(activeContractor.id)}`);
    if (!response.ok) {
      throw new Error('Failed to load records');
    }
    const records = await response.json();
    renderRecords(records);
  } catch (error) {
    recordsContainer.innerHTML = '';
    const errorEl = document.createElement('p');
    errorEl.className = 'error';
    errorEl.textContent = 'Не удалось загрузить формы. Попробуйте позже.';
    recordsContainer.appendChild(errorEl);
  }
}

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = loginUsernameInput ? loginUsernameInput.value.trim() : '';
    const password = loginPasswordInput ? loginPasswordInput.value : '';

    if (loginError) {
      loginError.textContent = defaultLoginErrorMessage;
      loginError.classList.add('hidden');
    }

    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        if (response.status === 401) {
          if (loginError) {
            loginError.textContent = defaultLoginErrorMessage || 'Неверный логин или пароль';
            loginError.classList.remove('hidden');
          }
          return;
        }
        throw new Error('Failed login request');
      }

      const data = await response.json();
      activeContractor = data.contractor;

      loginScreen.classList.add('hidden');
      app.classList.remove('hidden');
      loginForm.reset();

      if (companyNameEl && activeContractor?.name) {
        const contractorName = activeContractor.name;
        const decoratedName = /[«"“”]/.test(contractorName)
          ? contractorName
          : `«${contractorName}»`;
        companyNameEl.textContent = `Подрядчик ${decoratedName}`;
      }

      showFormError('');
      setActiveTab('formTab');
      renderRecords([]);
      await loadRecords();

      setTimeout(() => {
        if (numberInput) {
          numberInput.focus();
        }
      }, 0);
    } catch (error) {
      if (loginError) {
        loginError.textContent = 'Не удалось выполнить вход. Попробуйте позже.';
        loginError.classList.remove('hidden');
      }
    }
  });
}

if (logoutBtn && loginForm) {
  logoutBtn.addEventListener('click', () => {
    activeContractor = null;
    app.classList.add('hidden');
    loginScreen.classList.remove('hidden');
    loginForm.reset();
    if (companyNameEl) {
      companyNameEl.textContent = '';
    }
    if (loginError) {
      loginError.textContent = defaultLoginErrorMessage;
      loginError.classList.add('hidden');
    }
    showFormError('');
    if (recordsContainer) {
      recordsContainer.innerHTML = '';
    }
    updateDropZoneText();
    setActiveTab('formTab');
    setTimeout(() => {
      if (loginUsernameInput) {
        loginUsernameInput.focus();
      }
    }, 0);
  });
}

if (nextBtn && modal) {
  nextBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
    if (numberInput) {
      numberInput.focus();
    }
  });
}

if (yearInput) {
  yearInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '').slice(0, 8);
    if (value.length >= 5) {
      e.target.value = `${value.slice(0, 2)}.${value.slice(2, 4)}.${value.slice(4)}`;
    } else if (value.length >= 3) {
      e.target.value = `${value.slice(0, 2)}.${value.slice(2)}`;
    } else {
      e.target.value = value;
    }
  });
}

function validateFiles(fileList) {
  const invalid = Array.from(fileList || []).filter((file) =>
    file.name.toLowerCase().endsWith('.exe')
  );

  if (invalid.length > 0) {
    showFormError('Загрузка файлов с расширением .exe запрещена');
    return false;
  }

  showFormError('');
  return true;
}

function updateDropZoneText() {
  if (!dropZoneText || !fileInput) return;

  if (fileInput.files && fileInput.files.length > 0) {
    dropZoneText.textContent = Array.from(fileInput.files)
      .map((f) => f.name)
      .join(', ');
    dropZoneText.style.color = '#3399ff';
  } else {
    dropZoneText.textContent = 'выбрать файл';
    dropZoneText.style.color = 'rgba(51, 153, 255, 0.4)';
  }
}

if (dropZone && fileInput) {
  dropZone.addEventListener('click', () => fileInput.click());

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (!validateFiles(files)) {
      return;
    }
    if (typeof DataTransfer !== 'undefined') {
      const dataTransfer = new DataTransfer();
      Array.from(files).forEach((file) => dataTransfer.items.add(file));
      fileInput.files = dataTransfer.files;
    } else {
      fileInput.files = files;
    }
    updateDropZoneText();
  });
}

if (fileInput) {
  fileInput.addEventListener('change', () => {
    if (!validateFiles(fileInput.files)) {
      fileInput.value = '';
    }
    updateDropZoneText();
  });
}

function formatRecordString(formData) {
  const parts = [
    `№ ${formData.get('number')}`,
    `УКО ${formData.get('uko')}`,
    `Договор ${formData.get('contract')}`,
    `Назначение ${formData.get('purpose')}`,
    `Дата ${formData.get('year')}`,
    `КС-3 ${formData.get('ks3')}`,
    `Мероприятие ${formData.get('eventName')}`,
    `Адрес ${formData.get('address')}`,
    `Стоимость ${formData.get('contractorCost')}`
  ];
  return parts.join(' | ');
}

if (dataForm) {
  dataForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    if (!activeContractor) {
      showFormError('Сначала выполните вход');
      return;
    }

    showFormError('');

    if (!validateFiles(fileInput?.files)) {
      return;
    }

    formData.append('contractorId', activeContractor.id);
    const summary = formatRecordString(formData);

    try {
      const response = await fetch('/records', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: '' }));
        const message = errorData.error || 'Не удалось отправить форму. Попробуйте позже.';
        showFormError(message);
        return;
      }

      await loadRecords();
      form.reset();
      updateDropZoneText();
      if (recordStringEl && modal) {
        recordStringEl.textContent = summary;
        modal.classList.remove('hidden');
      }
    } catch (error) {
      showFormError('Не удалось отправить форму. Попробуйте позже.');
    }
  });
}
