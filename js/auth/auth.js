import elements from '../dom/elements.js';
import { login as loginRequest } from '../api/client.js';
import {
  setActiveContractor,
  clearActiveContractor,
  getActiveContractor
} from '../state/session.js';
import { showAppView, showLoginView } from '../ui/appView.js';
import { clearFormError } from '../ui/formError.js';

const defaultLoginErrorMessage = elements.loginError?.textContent || 'Неверный логин или пароль';

function showLoginError(message) {
  if (!elements.loginError) return;
  elements.loginError.textContent = message;
  elements.loginError.classList.remove('hidden');
}

function hideLoginError() {
  if (!elements.loginError) return;
  elements.loginError.textContent = defaultLoginErrorMessage;
  elements.loginError.classList.add('hidden');
}

function focusLogin() {
  elements.loginUsername?.focus();
}

export function initAuth({ onLoginSuccess, onLogout } = {}) {
  const { loginForm, logoutButton } = elements;

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const username = elements.loginUsername?.value.trim() || '';
      const password = elements.loginPassword?.value || '';
      hideLoginError();

      try {
        const result = await loginRequest(username, password);

        if (!result.success) {
          if (result.error === 'unauthorized') {
            showLoginError(defaultLoginErrorMessage);
            return;
          }
          showLoginError('Не удалось выполнить вход. Попробуйте позже.');
          return;
        }

        setActiveContractor(result.contractor);
        showAppView(result.contractor);
        loginForm.reset();
        clearFormError();

        if (onLoginSuccess) {
          await onLoginSuccess(result.contractor);
        }
      } catch (error) {
        showLoginError('Не удалось выполнить вход. Попробуйте позже.');
      }
    });
  }

  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      clearActiveContractor();
      showLoginView();
      loginForm?.reset();
      hideLoginError();
      clearFormError();
      focusLogin();

      if (onLogout) {
        onLogout();
      }
    });
  }

  const existingContractor = getActiveContractor();

  if (existingContractor) {
    hideLoginError();
    showAppView(existingContractor);
    if (onLoginSuccess) {
      const maybePromise = onLoginSuccess(existingContractor);
      if (maybePromise && typeof maybePromise.then === 'function') {
        maybePromise.catch(() => {});
      }
    }
    return;
  }

  focusLogin();
}
