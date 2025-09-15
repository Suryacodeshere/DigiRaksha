const API_BASE_URL = import.meta.env.VITE_MODEL_API_BASE || 'http://localhost:5000';

export async function predictFraudWithModel(upiId) {
  try {
    const res = await fetch(`${API_BASE_URL}/predict-fraud`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ upi_id: upiId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Request failed with ${res.status}`);
    }
    return await res.json();
  } catch (e) {
    console.warn('Model API error:', e.message);
    return null;
  }
}

