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
const defaultLoginErrorMessage = loginError ? loginError.textContent : '';

let activeContractor = null;

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

const yearInput = document.getElementById('year');
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

const dropZone = document.getElementById('dropZone');
const dropZoneText = document.getElementById('dropZoneText');
const fileInput = document.getElementById('attachments');

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
    fileInput.files = e.dataTransfer.files;
    updateDropZoneText();
  });
}

if (fileInput) {
  fileInput.addEventListener('change', updateDropZoneText);
}

const dataForm = document.getElementById('dataForm');

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
    const summary = formatRecordString(formData);
    await fetch('/records', {
      method: 'POST',
      body: formData
    });
    form.reset();
    updateDropZoneText();
    if (recordStringEl && modal) {
      recordStringEl.textContent = summary;
      modal.classList.remove('hidden');
    }
  });
}
