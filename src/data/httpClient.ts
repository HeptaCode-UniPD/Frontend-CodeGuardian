interface HttpOptions {
  extractErrorMessage?: boolean;
}

async function handleError(res: Response, options?: HttpOptions): Promise<never> {
  if (options?.extractErrorMessage) {
    const errorData = await res.json().catch(() => null);
    const raw = errorData?.message;

    const message = Array.isArray(raw) && raw.some((m: string) => m.includes("url must be"))
      ? "URL non valido."
      : (Array.isArray(raw) ? raw[0] : raw) ?? res.statusText;

    throw new Error(message);
  }
  throw new Error(res.statusText);
}
export async function get<T>(url: string, options?: HttpOptions): Promise<T> {
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) return handleError(res, options);
  return res.json();
}

export async function post<T>(url: string, body: unknown, options?: HttpOptions): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) return handleError(res, options);
  return res.json();
}

export async function del<T>(url: string, body: unknown, options?: HttpOptions): Promise<T | void> {
  const res = await fetch(url, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) return handleError(res, options);
  if (res.status === 204 || res.headers.get('content-length') === '0') return;
  try {
    return await res.json();
  } catch {
    return;
  }
}