const API_BASE_URL = process.env.API_BASE_URL!;
const API_USERNAME = process.env.API_USERNAME!;
const API_PASSWORD = process.env.API_PASSWORD!;

const authHeader =
  "Basic " + Buffer.from(`${API_USERNAME}:${API_PASSWORD}`).toString("base64");

export async function apiPost(path: string, body: unknown) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: authHeader },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
}

export async function apiPut(path: string, body: unknown) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: authHeader },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
}

export async function apiDelete(path: string, body: unknown) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", Authorization: authHeader },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
}
