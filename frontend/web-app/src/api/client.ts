import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

export const NODE_GATEWAY_URL = 'http://localhost:4000';
export const GO_MATCHING_URL = 'http://localhost:8080';
export const GO_CHAT_URL = 'http://localhost:9000';

const attachAuthInterceptor = (instance: AxiosInstance) => {
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem('topolgira_token') || localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      config.headers['X-Client-Version'] = '2.4.0';
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
