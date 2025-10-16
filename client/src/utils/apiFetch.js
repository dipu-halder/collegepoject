
export default async function apiFetch(path, opts = {}) {
  const url = path.startsWith("http") ? path : `${import.meta.env.VITE_API_URL}${path}`;
  const headers = Object.assign({}, opts.headers || {});
  if (!headers["Content-Type"] && !(opts.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  // authorization: prefer explicit header, otherwise use localStorage token
  if (!headers.Authorization) {
    const token = localStorage.getItem("token");
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, Object.assign({}, opts, { headers }));
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = null; }
  if (!res.ok) {
    const err = new Error(json?.message || `Request failed: ${res.status}`);
    err.status = res.status;
    err.body = json;
    throw err;
  }
  return json;
}
