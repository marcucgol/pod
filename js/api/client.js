export async function login(username, password) {
  const response = await fetch('/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  });

  if (response.status === 401) {
    return { success: false, error: 'unauthorized' };
  }

  if (!response.ok) {
    throw new Error('Failed login request');
  }

  const data = await response.json();
  return { success: true, contractor: data.contractor };
}

export async function fetchRecords(contractorId) {
  const response = await fetch(`/records?contractorId=${encodeURIComponent(contractorId)}`);
  if (!response.ok) {
    throw new Error('Failed to load records');
  }
  return response.json();
}

export async function submitRecord(formData) {
  const response = await fetch('/records', {
    method: 'POST',
    body: formData
  });

  if (response.ok) {
    const data = await response.json().catch(() => ({ success: true }));
    return { success: true, record: data.record };
  }

  let message = 'Не удалось отправить форму. Попробуйте позже.';
  try {
    const errorData = await response.json();
    if (errorData && errorData.error) {
      message = errorData.error;
    }
  } catch (error) {
    // ignore json parse errors
  }

  return { success: false, error: message };
}
