import elements from '../dom/elements.js';

export function showFormError(message) {
  const { formError } = elements;
  if (!formError) return;

  formError.textContent = message;
  formError.classList.toggle('hidden', !message);
}

export function clearFormError() {
  showFormError('');
}
