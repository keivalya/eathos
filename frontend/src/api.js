/* API client for the Fridge-to-Recipe backend */

const BASE_URL = 'http://localhost:8000';

export async function analyzeImage(file) {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${BASE_URL}/api/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Analysis failed: ${response.status}`);
  }

  return response.json();
}

export async function sendAction(sessionId, action, data = null) {
  const response = await fetch(`${BASE_URL}/api/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionId,
      action,
      data,
    }),
  });

  if (!response.ok) {
    throw new Error(`Action failed: ${response.status}`);
  }

  return response.json();
}

export async function getInventory(sessionId) {
  const response = await fetch(`${BASE_URL}/api/inventory/${sessionId}`);

  if (!response.ok) {
    throw new Error(`Inventory fetch failed: ${response.status}`);
  }

  return response.json();
}
