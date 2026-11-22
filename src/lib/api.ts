/** Tiny client for the Worker API in worker/index.ts. */
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

export async function api<T>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, ...rest } = init
  const headers = new Headers(rest.headers)
  if (json !== undefined) headers.set('content-type', 'application/json')
  const res = await fetch(path, {
    credentials: 'same-origin',
    ...rest,
    headers,
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  })
  const isJson = (res.headers.get('content-type') ?? '').includes('application/json')
  // No JSON means no API behind this host (e.g. `vite dev` alone): callers fall back to browser storage.
  if (!isJson) throw new ApiError(0, 'API unavailable')
  const data = await res.json()
  if (!res.ok) throw new ApiError(res.status, (data as { error?: string }).error ?? 'Request failed')
  return data as T
}

export const errorText = (e: unknown) => (e instanceof Error ? e.message : 'Something went wrong. Please try again.')
