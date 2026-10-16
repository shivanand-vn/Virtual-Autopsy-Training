declare const __INJECTED_API_URL__: string | undefined;

function cleanApiUrl(url?: string): string {
  if (!url || typeof url !== 'string' || !url.trim()) return '';
  let cleaned = url.trim().replace(/\/+$/, '');
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = `https://${cleaned}`;
  }
  if (!cleaned.endsWith('/api')) {
    cleaned = `${cleaned}/api`;
  }
  return cleaned;
}

export function getApiBaseUrl(): string {
  // 1. Compile-time injected variable from vite.config.ts
  if (typeof __INJECTED_API_URL__ !== 'undefined' && __INJECTED_API_URL__) {
    const cleaned = cleanApiUrl(__INJECTED_API_URL__);
    if (cleaned) return cleaned;
  }

  // 2. Client-side import.meta.env variations
  const envCandidates = [
    import.meta.env.VITE_API_URL,
    import.meta.env.VITE_BACKEND_URL,
    import.meta.env.VITE_RENDER_URL,
    (import.meta.env as any).RENDER_URL,
    (import.meta.env as any).RENDER_LINK,
    (import.meta.env as any).BACKEND_URL,
    (import.meta.env as any).API_URL,
    (import.meta.env as any).RENDER_API,
    (import.meta.env as any).SERVER_URL,
  ];

  for (const candidate of envCandidates) {
    if (candidate && typeof candidate === 'string' && candidate.trim()) {
      const cleaned = cleanApiUrl(candidate);
      if (cleaned) return cleaned;
    }
  }

  // 3. Browser runtime storage (allows quick testing / override without redeploy)
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('vat_api_url') || sessionStorage.getItem('vat_api_url');
      if (stored) {
        const cleaned = cleanApiUrl(stored);
        if (cleaned) return cleaned;
      }
    } catch {}

    const hostname = window.location.hostname;
    // In production on Vercel or any remote domain: connect to live Render backend
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return 'https://virtual-autopsy-training.onrender.com/api';
    }
  }

  return 'http://localhost:5000/api';
}

export const API_BASE_URL = getApiBaseUrl();

export function buildUrl(endpoint: string): string {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  const base = getApiBaseUrl().replace(/\/+$/, '');
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${base}${path}`;
}

export function sanitizeErrorMessage(
  message?: string,
  fallback = 'Unable to continue at the moment. Please check your internet connection and try again.'
): string {
  if (!message || typeof message !== 'string') return fallback;
  const lower = message.toLowerCase();
  if (
    lower.includes('failed to fetch') ||
    lower.includes('network') ||
    lower.includes('connection_refused') ||
    lower.includes('connection refused') ||
    lower.includes('econnrefused') ||
    lower.includes('server') ||
    lower.includes('backend') ||
    lower.includes('load failed') ||
    lower.includes('cors') ||
    lower.includes('internal') ||
    lower.includes('status 5') ||
    lower.includes('status 404') ||
    lower.includes('status 502') ||
    lower.includes('status 503') ||
    lower.includes('status 504') ||
    lower.includes('invalid server response') ||
    lower.includes('unexpected token') ||
    lower.includes('localhost')
  ) {
    return fallback;
  }
  return message;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  errors?: any;
}

export function getAuthToken(): string | null {
  return localStorage.getItem('vat_auth_token');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('vat_auth_token', token);
}

export function clearAuthToken(): void {
  localStorage.removeItem('vat_auth_token');
  localStorage.removeItem('vat_user');
  localStorage.removeItem('va_lms_courses_v5');
  localStorage.removeItem('va_lms_courses_v4');
  localStorage.removeItem('va_lms_completed_topic_ids');
  localStorage.removeItem('va_lms_completed_topic_ids_v2');
  localStorage.removeItem('va_lms_completed_topics_v3');
  localStorage.removeItem('va_lms_assessment_results_v2');
  localStorage.removeItem('va_lms_assignment_submissions');
  localStorage.removeItem('va_lms_assignment_submissions_v2');
  try {
    sessionStorage.clear();
    window.dispatchEvent(new Event('auth-logout'));
  } catch {
    // Ignore in non-browser environments
  }
}

export function getStoredUser(): any | null {
  try {
    const raw = localStorage.getItem('vat_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: any): void {
  localStorage.setItem('vat_user', JSON.stringify(user));
}

async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const url = buildUrl(endpoint);

  const isUpload = options.body instanceof FormData;
  const timeoutMs = isUpload ? 120000 : 15000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
      signal: options.signal || controller.signal,
    });
  } catch (error: any) {
    clearTimeout(timeoutId);
    const isTimeout = error?.name === 'AbortError';
    const fallbackMsg = isTimeout
      ? 'The request took too long to complete. The server may be warming up, please try again shortly.'
      : 'Unable to continue at the moment. Please check your internet connection and try again.';
    const err = new Error(fallbackMsg) as Error & { status: number; data: any; isNetworkError: boolean; isTimeout?: boolean };
    err.status = isTimeout ? 504 : 0;
    err.data = {
      success: false,
      message: fallbackMsg,
    };
    err.isNetworkError = !isTimeout;
    err.isTimeout = isTimeout;
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  const data = await response.json().catch(() => ({
    success: false,
    message: 'Unable to process request right now. Please try again.',
  }));

  if (!response.ok || data.success === false) {
    const rawMsg = data.message || `Request could not be completed`;
    const cleanMsg = sanitizeErrorMessage(
      rawMsg,
      'Unable to continue at the moment. Please check your internet connection and try again.'
    );
    const err = new Error(cleanMsg) as Error & { status: number; data: any; retryAfter?: number };
    err.status = response.status;
    err.data = data;
    const retryHeader = response.headers.get('Retry-After');
    const headerSec = retryHeader ? parseInt(retryHeader, 10) : undefined;
    const bodySec = data?.errors?.retryAfter || (typeof data?.data?.retryAfter === 'number' ? data.data.retryAfter : undefined);
    err.retryAfter = headerSec || bodySec || (response.status === 429 ? 900 : undefined);
    throw err;
  }

  return data;
}

export const api = {
  get: <T = any>(url: string, headers?: Record<string, string>) =>
    request<T>(url, { method: 'GET', headers }),

  post: <T = any>(url: string, body?: any, headers?: Record<string, string>) =>
    request<T>(url, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
      headers,
    }),

  put: <T = any>(url: string, body?: any, headers?: Record<string, string>) =>
    request<T>(url, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
      headers,
    }),

  patch: <T = any>(url: string, body?: any, headers?: Record<string, string>) =>
    request<T>(url, {
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
      headers,
    }),

  delete: <T = any>(url: string, headers?: Record<string, string>) =>
    request<T>(url, { method: 'DELETE', headers }),

  upload: <T = any>(
    url: string,
    formData: FormData,
    onProgress?: (percent: number) => void,
    signal?: AbortSignal
  ): Promise<ApiResponse<T>> => {
    return new Promise((resolve, reject) => {
      if (signal?.aborted) {
        reject(new DOMException('Upload aborted by user', 'AbortError'));
        return;
      }

      const token = getAuthToken();
      const endpoint = buildUrl(url);
      const xhr = new XMLHttpRequest();

      if (signal) {
        signal.addEventListener('abort', () => {
          try {
            xhr.abort();
          } catch {
            // ignore
          }
          reject(new DOMException('Upload aborted by user', 'AbortError'));
        });
      }

      xhr.open('POST', endpoint, true);
      xhr.withCredentials = true;

      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      // Extended 30 minutes timeout on the browser side for large video uploads
      xhr.timeout = 30 * 60 * 1000;

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && event.total > 0) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        try {
          const data = JSON.parse(xhr.responseText || '{}');
          if (xhr.status >= 200 && xhr.status < 300 && data.success !== false) {
            if (onProgress) onProgress(100);
            resolve(data);
          } else {
            const errorMsg = sanitizeErrorMessage(
              data.message,
              'Unable to complete upload. Please try again.'
            );
            const err = new Error(errorMsg) as Error & { status: number; data: any };
            err.status = xhr.status;
            err.data = data;
            reject(err);
          }
        } catch {
          reject(new Error('Unable to complete upload. Please try again.'));
        }
      };

      xhr.onabort = () => {
        reject(new DOMException('Upload aborted by user', 'AbortError'));
      };

      xhr.onerror = () => {
        reject(new Error('Unable to complete upload. Please check your connection and try again.'));
      };

      xhr.ontimeout = () => {
        reject(new Error('Upload timed out. Please try again with a faster connection.'));
      };

      xhr.send(formData);
    });
  },
};
