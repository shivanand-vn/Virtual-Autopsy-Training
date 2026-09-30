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

  upload: <T = any>(
    url: string,
    formData: FormData,
    onProgress?: (percent: number) => void
  ): Promise<ApiResponse<T>> => {
    return new Promise((resolve, reject) => {
      const token = getAuthToken();
      const endpoint = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
      const xhr = new XMLHttpRequest();

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
            const errorMsg = data.message || `Request failed with status ${xhr.status}`;
            const err = new Error(errorMsg) as Error & { status: number; data: any };
            err.status = xhr.status;
            err.data = data;
            reject(err);
          }
        } catch {
          reject(new Error('Invalid server response'));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error during media upload. Please check your connection.'));
      };

      xhr.ontimeout = () => {
        reject(new Error('Upload timed out. Please try again with a faster connection or smaller file.'));
      };

      xhr.send(formData);
    });
  },
};
