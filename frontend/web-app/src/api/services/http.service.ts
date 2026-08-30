import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import { defaultApiClient } from '../client';

export class HttpService {
  /**
   * Generic GET request service wrapper
   */
  static async getService<T = any>(
    url: string,
    config?: AxiosRequestConfig,
    client: AxiosInstance = defaultApiClient
  ): Promise<T> {
    const response = await client.get<T>(url, config);
    return response.data;
  }

  /**
   * Generic POST request service wrapper
   */
  static async postService<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
    client: AxiosInstance = defaultApiClient
  ): Promise<T> {
    const response = await client.post<T>(url, data, config);
    return response.data;
  }

  /**
   * Generic PUT request service wrapper
   */
  static async putService<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
    client: AxiosInstance = defaultApiClient
  ): Promise<T> {
    const response = await client.put<T>(url, data, config);
    return response.data;
  }

  /**
   * Generic PATCH request service wrapper
   */
  static async patchService<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
    client: AxiosInstance = defaultApiClient
  ): Promise<T> {
    const response = await client.patch<T>(url, data, config);
    return response.data;
  }

  /**
   * Generic DELETE request service wrapper
   */
  static async deleteService<T = any>(
    url: string,
    config?: AxiosRequestConfig,
    client: AxiosInstance = defaultApiClient
  ): Promise<T> {
    const response = await client.delete<T>(url, config);
    return response.data;
  }
}
