const STORAGE_KEY = 'app.activeContractor';

function safeGetStorage() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage;
  } catch (error) {
    return null;
  }
}

function loadPersistedContractor() {
  const storage = safeGetStorage();
  if (!storage) {
    return null;
  }

  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

let activeContractor = loadPersistedContractor();

function persistContractor(contractor) {
  const storage = safeGetStorage();
  if (!storage) {
    return;
  }

  if (!contractor) {
    storage.removeItem(STORAGE_KEY);
    return;
  }

  storage.setItem(STORAGE_KEY, JSON.stringify(contractor));
}

export function setActiveContractor(contractor) {
  activeContractor = contractor;
  persistContractor(contractor);
}

export function clearActiveContractor() {
  activeContractor = null;
  persistContractor(null);
}

export function getActiveContractor() {
  return activeContractor;
}

export function isAuthenticated() {
  return Boolean(activeContractor);
}
