import elements from '../dom/elements.js';
import { submitRecord } from '../api/client.js';
import { getActiveContractor } from '../state/session.js';
import { clearFormError, showFormError } from './formError.js';
import { formatRecordSummary } from '../utils/recordSummary.js';

function applyDateMask(event) {
  const input = event.target;
  let value = input.value.replace(/\D/g, '').slice(0, 8);

  if (value.length >= 5) {
    input.value = `${value.slice(0, 2)}.${value.slice(2, 4)}.${value.slice(4)}`;
  } else if (value.length >= 3) {
    input.value = `${value.slice(0, 2)}.${value.slice(2)}`;
  } else {
    input.value = value;
  }
}

export function createFormController({ onSubmitSuccess } = {}) {
  const { dataForm, fileInput, yearInput } = elements;
  let dropzoneController = null;

  const validateAttachments = (fileList) => {
    if (!fileList || fileList.length === 0) {
      clearFormError();
      return true;
    }

    const hasForbidden = Array.from(fileList).some((file) =>
      (file.name || '').toLowerCase().endsWith('.exe')
    );

    if (hasForbidden) {
      showFormError('Загрузка файлов с расширением .exe запрещена');
      return false;
    }

    clearFormError();
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!dataForm) return;

    const contractor = getActiveContractor();
    if (!contractor) {
      showFormError('Сначала выполните вход');
      return;
    }

    if (!validateAttachments(fileInput?.files || null)) {
      return;
    }

    const formData = new FormData(dataForm);
    formData.append('contractorId', contractor.id);
    const summary = formatRecordSummary(formData);

    try {
      const result = await submitRecord(formData);
      if (!result.success) {
        showFormError(result.error);
        return;
      }

      dataForm.reset();
      dropzoneController?.reset();
      clearFormError();

      if (onSubmitSuccess) {
        onSubmitSuccess(summary);
      }
    } catch (error) {
      showFormError('Не удалось отправить форму. Попробуйте позже.');
    }
  };

  if (yearInput) {
    yearInput.addEventListener('input', applyDateMask);
  }

  if (dataForm) {
    dataForm.addEventListener('submit', handleSubmit);
  }

  return {
    validateFiles: (files) => validateAttachments(files || null),
    attachDropzone(controller) {
      dropzoneController = controller;
    },
    reset() {
      dataForm?.reset();
      dropzoneController?.reset();
      clearFormError();
    },
    focusFirstField() {
      elements.numberInput?.focus();
    }
  };
}
