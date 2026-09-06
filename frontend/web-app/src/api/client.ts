import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

export const NODE_GATEWAY_URL = 'http://localhost:4000';
export const GO_MATCHING_URL = 'http://localhost:8080';
export const GO_CHAT_URL = 'http://localhost:9000';

export const getActiveToken = (): string => {
  return localStorage.getItem('topolgira_token') || sessionStorage.getItem('topolgira_token') || '';
};

export const getActiveUser = (): any => {
  const saved = localStorage.getItem('topolgira_user') || sessionStorage.getItem('topolgira_user');
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
};

const attachAuthInterceptor = (instance: AxiosInstance) => {
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getActiveToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
};

export const nodeApiClient: AxiosInstance = axios.create({
  baseURL: NODE_GATEWAY_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const goMatchingApiClient: AxiosInstance = axios.create({
  baseURL: GO_MATCHING_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const goChatApiClient: AxiosInstance = axios.create({
  baseURL: GO_CHAT_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

attachAuthInterceptor(nodeApiClient);
attachAuthInterceptor(goMatchingApiClient);
attachAuthInterceptor(goChatApiClient);

export const defaultApiClient = nodeApiClient;
