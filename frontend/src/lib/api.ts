const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = await response.json().catch(() => ({
    success: false,
    message: 'Invalid server response',
  }));

  if (!response.ok || data.success === false) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg) as Error & { status: number; data: any };
    err.status = response.status;
    err.data = data;
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

  upload: <T = any>(url: string, formData: FormData) =>
    request<T>(url, {
      method: 'POST',
      body: formData,
    }),
};
