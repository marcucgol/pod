const modal = document.getElementById('successModal');
const nextBtn = document.getElementById('nextBtn');
nextBtn.addEventListener('click', () => {
  modal.classList.add('hidden');
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

document.getElementById('dataForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  await fetch('/records', {
    method: 'POST',
    body: formData
  });
  form.reset();
  updateDropZoneText();
  modal.classList.remove('hidden');
});
