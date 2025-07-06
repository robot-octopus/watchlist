/**
 * Base API client for Tastytrade API
 * Handles authentication, error handling, and common request logic
 */

const BASE_URL = 'https://api.tastyworks.com';

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly response: Response | undefined;

  constructor(message: string, statusCode: number, response?: Response) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.response = response;
  }
}

export interface ApiClientOptions {
  authToken?: string;
  baseUrl?: string;
}

export class BaseApiClient {
  private authToken: string | undefined;
  private baseUrl: string;

  constructor(options: ApiClientOptions = {}) {
    this.authToken = options.authToken;
    this.baseUrl = options.baseUrl ?? BASE_URL;
  }

  protected async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'User-Agent': 'TastytradeWatchlistApp/1.0',
      ...(options.headers as Record<string, string>),
    };

    if (this.authToken) {
      // For Tastytrade session tokens, don't use Bearer prefix
      // Session tokens are used directly, access tokens need Bearer prefix
      headers.Authorization = this.authToken;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new ApiError(`API request failed: ${response.statusText}`, response.status, response);
    }

    return response.json();
  }

  protected async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  protected async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const options: RequestInit = {
      method: 'POST',
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    return this.request<T>(endpoint, options);
  }

  protected async put<T>(endpoint: string, data?: unknown): Promise<T> {
    const options: RequestInit = {
      method: 'PUT',
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    return this.request<T>(endpoint, options);
  }

  protected async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  setAuthToken(token: string): void {
    this.authToken = token;
  }
}
