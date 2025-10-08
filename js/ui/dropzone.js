import elements from '../dom/elements.js';

function assignFiles(files) {
  if (!elements.fileInput) return;

  if (typeof DataTransfer !== 'undefined') {
    const dataTransfer = new DataTransfer();
    Array.from(files || []).forEach((file) => dataTransfer.items.add(file));
    elements.fileInput.files = dataTransfer.files;
  } else {
    elements.fileInput.files = files;
  }
}

function updateDropZoneText() {
  if (!elements.dropZoneText || !elements.fileInput) return;

  const { files } = elements.fileInput;
  if (files && files.length > 0) {
    elements.dropZoneText.textContent = Array.from(files)
      .map((file) => file.name)
      .join(', ');
    elements.dropZoneText.style.color = '#3399ff';
  } else {
    elements.dropZoneText.textContent = 'выбрать файл';
    elements.dropZoneText.style.color = 'rgba(51, 153, 255, 0.4)';
  }
}

export function createDropzoneController({ validateFiles }) {
  const { dropZone, fileInput } = elements;
  if (!dropZone || !fileInput) {
    return {
      reset: () => {},
      update: () => {},
      apply: () => true
    };
  }

  const applyFiles = (files) => {
    if (!validateFiles(files)) {
      return false;
    }

    assignFiles(files);
    updateDropZoneText();
    return true;
  };

  dropZone.addEventListener('click', () => fileInput.click());

  dropZone.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });

  dropZone.addEventListener('drop', (event) => {
    event.preventDefault();
    dropZone.classList.remove('dragover');
    const files = event.dataTransfer.files;
    applyFiles(files);
  });

  fileInput.addEventListener('change', () => {
    if (!applyFiles(fileInput.files)) {
      fileInput.value = '';
      updateDropZoneText();
    }
  });

  updateDropZoneText();

  return {
    reset: () => {
      fileInput.value = '';
      updateDropZoneText();
    },
    update: updateDropZoneText,
    apply: applyFiles
  };
}
