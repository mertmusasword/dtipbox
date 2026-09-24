import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let accessToken: string | null = localStorage.getItem('token');

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

api.interceptors.request.use((config) => {
  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Do not intercept non-401, already-retried, login, or refresh requests
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        // Queue concurrent requests until current refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (newToken: string) => {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              resolve(api(originalRequest));
            },
            reject: (err: any) => {
              reject(err);
            },
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        const newToken = refreshResponse.data.data.accessToken;
        setAccessToken(newToken);
        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        setAccessToken(null);

        const path = window.location.pathname;
        const isPublicPath =
          path === '/login' ||
          path === '/register' ||
          path.startsWith('/tip/') ||
          path.startsWith('/loyalty/') ||
          path.startsWith('/menu/') ||
          path.startsWith('/m/') ||
          path.startsWith('/solutions/') ||
          path.startsWith('/tools/') ||
          path.startsWith('/guides/') ||
          path.startsWith('/blog/') ||
          path.startsWith('/compare/') ||
          path === '/catalog' ||
          path === '/technology-partners';

        if (!isPublicPath) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
