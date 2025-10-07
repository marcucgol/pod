import elements from '../dom/elements.js';

function decorateContractorName(name) {
  if (!name) return '';
  return /[«"“”]/.test(name) ? name : `«${name}»`;
}

export function showAppView(contractor) {
  if (elements.loginScreen) {
    elements.loginScreen.classList.add('hidden');
  }
  if (elements.app) {
    elements.app.classList.remove('hidden');
  }
  if (elements.companyName) {
    const decorated = decorateContractorName(contractor?.name);
    elements.companyName.textContent = decorated
      ? `Подрядчик ${decorated}`
      : '';
  }
}

export function showLoginView() {
  if (elements.app) {
    elements.app.classList.add('hidden');
  }
  if (elements.loginScreen) {
    elements.loginScreen.classList.remove('hidden');
  }
  if (elements.companyName) {
    elements.companyName.textContent = '';
  }
}
