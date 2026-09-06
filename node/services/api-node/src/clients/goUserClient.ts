import { logger } from '../utils/logger';

export interface RegisterGoUserPayload {
  email: string;
  password: string;
  phoneNumber?: string;
  name?: string;
  age?: number;
  gender?: string;
  city?: string;
  bio?: string;
  education?: string;
  profession?: string;
  relationshipGoal?: string;
  interests?: string[];
  languages?: string[];
  hobbies?: string[];
  foodPreferences?: string[];
  musicInterests?: string[];
  photos?: string[];
}

export interface IGoUserClient {
  registerUser(payload: RegisterGoUserPayload): Promise<any | null>;
  checkHealth(): Promise<boolean>;
}

export class GoUserClient implements IGoUserClient {
  constructor(private baseUrl: string) {}

  async registerUser(payload: RegisterGoUserPayload): Promise<any | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        logger.warn('Go User Service registration non-200 response', { status: response.status });
        return null;
      }

      const data = await response.json();
      logger.info('Forwarded registration internally to Go User Service (user-go)', { goData: data });
      return data;
    } catch (err: any) {
      logger.warn('Go User Service internal call offline or skipped', { error: err?.message || String(err) });
      return null;
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/health`);
      return res.ok;
    } catch {
      return false;
    }
  }
}
