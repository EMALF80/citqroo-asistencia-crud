const API_URL = "http://localhost:3001";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function getResource(resource) {
  return request(`/${resource}`);
}

export function createResource(resource, payload) {
  return request(`/${resource}`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateResource(resource, id, payload) {
  return request(`/${resource}/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function deleteResource(resource, id) {
  return request(`/${resource}/${id}`, {
    method: "DELETE"
  });
}

export { API_URL };

