import elements from '../dom/elements.js';

export function setActiveTab(targetId) {
  elements.tabButtons.forEach((button) => {
    const isActive = button.dataset.target === targetId;
    button.classList.toggle('active', isActive);
  });

  elements.tabPanels.forEach((panel) => {
    const isActive = panel.id === targetId;
    panel.classList.toggle('hidden', !isActive);
  });
}

export function initTabs({ onTabChange } = {}) {
  elements.tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const targetId = button.dataset.target;
      setActiveTab(targetId);
      if (onTabChange) {
        onTabChange(targetId);
      }
    });
  });
}
