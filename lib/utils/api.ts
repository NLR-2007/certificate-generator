/**
 * JSON fetch helper for client components.
 *
 * A route handler that crashes before it can reply is served Vercel's HTML
 * error page, and a route that is missing is served the HTML 404 page. Calling
 * `res.json()` on either throws `Unexpected token '<'`, which is meaningless to
 * a participant. This helper reads the body once as text, parses it only when
 * it actually is JSON, and otherwise raises a message worth showing.
 */
export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

function messageForStatus(status: number): string {
  if (status === 404) return "That service could not be reached. Please refresh the page and try again.";
  if (status === 429) return "Too many attempts. Please wait a moment and try again.";
  if (status >= 500) return "The server is temporarily unavailable. Please try again in a moment.";
  return "Something went wrong. Please try again.";
}

export async function fetchJson<T = any>(input: RequestInfo, init?: RequestInit): Promise<T> {
  let res: Response;

  try {
    res = await fetch(input, init);
  } catch {
    throw new ApiError("We couldn't reach the server. Check your connection and try again.", 0);
  }

  const raw = await res.text();
  let data: any = null;

  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      // Non-JSON body: an HTML error/404 page, a proxy notice, anything.
      throw new ApiError(messageForStatus(res.status), res.status);
    }
  }

  if (!res.ok) {
    throw new ApiError(
      (data && typeof data.error === "string" && data.error) || messageForStatus(res.status),
      res.status
    );
  }

  return data as T;
}
