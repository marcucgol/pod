import elements from '../dom/elements.js';

function focusNumberField() {
  elements.numberInput?.focus();
}

export function showModal(summary) {
  if (!elements.modal || !elements.recordString) return;
  elements.recordString.textContent = summary;
  elements.modal.classList.remove('hidden');
}

export function hideModal() {
  if (!elements.modal) return;
  elements.modal.classList.add('hidden');
}

export function initModal({ onNext } = {}) {
  if (!elements.nextButton) return;

  elements.nextButton.addEventListener('click', () => {
    hideModal();
    if (onNext) {
      onNext();
    } else {
      focusNumberField();
    }
  });
}
