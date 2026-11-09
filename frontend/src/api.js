const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Helper to process API responses and provide standard errors
 */
async function handleResponse(response) {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    let errorMsg = 'An unexpected error occurred';
    if (typeof data === 'object' && data !== null) {
      if (typeof data.detail === 'string') {
        errorMsg = data.detail;
      } else if (Array.isArray(data.detail)) {
        // Pydantic validation errors
        errorMsg = data.detail.map(d => `${d.loc ? d.loc.join('.') : 'field'}: ${d.msg}`).join(', ');
      }
    } else if (typeof data === 'string' && data.length > 0) {
      errorMsg = data;
    }
    throw new Error(errorMsg);
  }

  return data;
}

export const notesApi = {
  checkHealth: async () => {
    const res = await fetch(`${BASE_URL}/health`);
    return handleResponse(res);
  },

  getAllNotes: async () => {
    const res = await fetch(`${BASE_URL}/api/notes`);
    return handleResponse(res);
  },

  createNote: async ({ title, content }) => {
    const res = await fetch(`${BASE_URL}/api/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, content }),
    });
    return handleResponse(res);
  },

  updateNote: async (id, { title, content }) => {
    const res = await fetch(`${BASE_URL}/api/notes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, content }),
    });
    return handleResponse(res);
  },

  deleteNote: async (id) => {
    const res = await fetch(`${BASE_URL}/api/notes/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },
};

