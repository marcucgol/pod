const modal = document.getElementById('successModal');
const nextBtn = document.getElementById('nextBtn');
const app = document.getElementById('app');
const loginScreen = document.getElementById('loginScreen');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const recordStringEl = document.getElementById('recordString');

const credentials = {
  username: 'rogaikopyta',
  password: 'qwerty123'
};

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (username === credentials.username && password === credentials.password) {
      loginError.classList.add('hidden');
      loginScreen.classList.add('hidden');
      app.classList.remove('hidden');
      setTimeout(() => document.getElementById('number').focus(), 0);
    } else {
      loginError.classList.remove('hidden');
    }
  });
}

nextBtn.addEventListener('click', () => {
  modal.classList.add('hidden');
  document.getElementById('number').focus();
});

const yearInput = document.getElementById('year');
yearInput.addEventListener('input', (e) => {
  let value = e.target.value.replace(/\D/g, '').slice(0, 8);
  if (value.length >= 5) {
    e.target.value = `${value.slice(0,2)}.${value.slice(2,4)}.${value.slice(4)}`;
  } else if (value.length >= 3) {
    e.target.value = `${value.slice(0,2)}.${value.slice(2)}`;
  } else {
    e.target.value = value;
  }
});

const dropZone = document.getElementById('dropZone');
const dropZoneText = document.getElementById('dropZoneText');
const fileInput = document.getElementById('attachments');

function updateDropZoneText() {
  if (fileInput.files && fileInput.files.length > 0) {
    dropZoneText.textContent = Array.from(fileInput.files).map(f => f.name).join(', ');
    dropZoneText.style.color = '#3399ff';
  } else {
    dropZoneText.textContent = 'выбрать файл';
    dropZoneText.style.color = 'rgba(51, 153, 255, 0.4)';
  }
}

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

fileInput.addEventListener('change', updateDropZoneText);

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
    recordStringEl.textContent = summary;
    modal.classList.remove('hidden');
  });
}
