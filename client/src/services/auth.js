import { apiFetch } from "./api";

/**
 * Register a new user
 * @param {Object} data - { name, email, password, userName? }
 */
export async function signup({ name, email, password, userName }) {
  const result = await apiFetch("/api/v1/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password, userName }),
  });

  if (result?.token) {
    localStorage.setItem("auth_token", result.token);
    const user = result.user || { name, email };
    localStorage.setItem("auth_user", JSON.stringify(user));
  }

  return result;
}

/**
 * Sign in an existing user
 * @param {Object} data - { email, password }
 */
export async function signin({ email, password }) {
  const result = await apiFetch("/api/v1/auth/signin", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (result?.token) {
    localStorage.setItem("auth_token", result.token);
    const user = result.user || { email };
    localStorage.setItem("auth_user", JSON.stringify(user));
  }

  return result;
}

/**
 * Logout user
 */
export async function logout() {
  try {
    await apiFetch("/api/v1/auth/logout", {
      method: "POST",
    });
  } finally {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  }
}

/**
 * Get cached user session from localStorage
 */
export function getSavedUser() {
  try {
    const raw = localStorage.getItem("auth_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
  return !!localStorage.getItem("auth_token");
}
