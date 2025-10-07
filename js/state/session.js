let activeContractor = null;

export function setActiveContractor(contractor) {
  activeContractor = contractor;
}

export function clearActiveContractor() {
  activeContractor = null;
}

export function getActiveContractor() {
  return activeContractor;
}

export function isAuthenticated() {
  return Boolean(activeContractor);
}
