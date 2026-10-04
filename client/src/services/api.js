const BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

/**
 * Common API fetch helper
 * @param {string} endpoint - API path, e.g. "/api/v1/auth/signin"
 * @param {RequestInit} [options] - fetch options
 */
export async function apiFetch(endpoint, options = {}) {
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}${normalizedEndpoint}`;

  const token = localStorage.getItem("auth_token");
  const headers = new Headers(options.headers || {});

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Only set Content-Type to JSON if body is NOT FormData
  const isFormData = options.body instanceof FormData;
  if (!isFormData && !headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: options.credentials || "include",
  });

  let data;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    const text = await response.text();
    data = { message: text };
  }

  if (!response.ok) {
    const errorMsg =
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}: ${response.statusText}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export default apiFetch;
