// src/utils/apiFetch.js
const BASE =
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_API_BASE ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

/**
 * apiFetch(endpoint, { method, headers, body, credentials })
 * - endpoint: string starting with '/' e.g. '/api/order/123'
 * - body: object (will be JSON.stringified) or FormData
 */
export async function apiFetch(endpoint, options = {}) {
  const { method = "GET", headers = {}, body = null, credentials = "same-origin" } = options;

  // Normalize token from localStorage (accept raw token or "Bearer <token>")
  const raw = localStorage.getItem("token") || "";
  const auth = raw ? (raw.startsWith("Bearer ") ? raw : `Bearer ${raw}`) : null;

  const opts = {
    method,
    headers: { ...headers },
    credentials,
  };

  if (auth) opts.headers.Authorization = auth;

  if (body != null) {
    // If FormData, don't set Content-Type
    if (body instanceof FormData) {
      opts.body = body;
    } else if (typeof body === "object") {
      opts.headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(body);
    } else {
      opts.body = body; // string etc
    }
  }

  const res = await fetch(`${BASE}${endpoint}`, opts);
  const text = await res.text().catch(() => "");
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const err = new Error(data?.message || `Request failed: ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export default apiFetch;
