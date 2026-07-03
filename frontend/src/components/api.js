const API_URL = import.meta.env.VITE_API_URL;

async function handleResponse(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export function createJob(title, file) {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("file", file);
  return fetch(`${API_URL}/jobs`, { method: "POST", body: formData }).then(handleResponse);
}

export function uploadResumes(jobId, files) {
  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file);
  }
  return fetch(`${API_URL}/jobs/${jobId}/resumes`, { method: "POST", body: formData }).then(handleResponse);
}

export function rankResumes(jobId) {
  return fetch(`${API_URL}/jobs/${jobId}/rank`, { method: "POST" }).then(handleResponse);
}

export function getResults(jobId) {
  return fetch(`${API_URL}/jobs/${jobId}/results`).then(handleResponse);
}