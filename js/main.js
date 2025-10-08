import { initAuth } from './auth/auth.js';
import { createDropzoneController } from './ui/dropzone.js';
import { createFormController } from './ui/form.js';
import { initModal, showModal } from './ui/modal.js';
import {
  loadRecords,
  clearRecords,
  startRecordsAutoRefresh,
  stopRecordsAutoRefresh
} from './ui/records.js';
import { initTabs, setActiveTab } from './ui/tabs.js';

const formController = createFormController({
  onSubmitSuccess: (summary) => {
    showModal(summary);
    loadRecords();
  }
});

const dropzoneController = createDropzoneController({
  validateFiles: formController.validateFiles
});

formController.attachDropzone(dropzoneController);

initModal({
  onNext: () => formController.focusFirstField()
});

initTabs({
  onTabChange: (targetId) => {
    if (targetId === 'recordsTab') {
      loadRecords();
    }
  }
});

initAuth({
  onLoginSuccess: async () => {
    formController.reset();
    clearRecords();
    await loadRecords();
    startRecordsAutoRefresh();
    formController.focusFirstField();
    setActiveTab('formTab');
  },
  onLogout: () => {
    stopRecordsAutoRefresh();
    formController.reset();
    clearRecords();
    setActiveTab('formTab');
  }
});
