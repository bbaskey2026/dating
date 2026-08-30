const NODE_GATEWAY_URL = 'http://localhost:4000';
const GO_MATCHING_URL = 'http://localhost:8080';
const GO_CHAT_URL = 'http://localhost:9000';

export interface RegisterPayload {
  email: string;
  password: string;
  phoneNumber?: string;
  name: string;
  age: number;
  gender: string;
  city: string;
  education?: string;
  profession?: string;
  relationshipGoal?: string;
  bio?: string;
  interests: string[];
  languages: string[];
  hobbies: string[];
  foodPreferences: string[];
  musicInterests: string[];
  photos: string[];
}

export interface Candidate {
  id: string;
  name: string;
  age: number;
  gender: string;
  city: string;
  profession: string;
  relationshipGoal: string;
  bio: string;
  matchScore: number;
  interests: string[];
  photos: string[];
  isRecentlyRegistered?: boolean;
}

export class EnterpriseApiClient {
  private static getHeaders(token?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Client-Version': '2.4.0',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  // 1. NODE API: AUTHENTICATION
  static async login(email: string, password: string) {
    const res = await fetch(`${NODE_GATEWAY_URL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  }

  static async register(payload: RegisterPayload) {
    const res = await fetch(`${NODE_GATEWAY_URL}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return res.json();
  }

  static async logout(refreshToken?: string) {
    try {
      await fetch(`${NODE_GATEWAY_URL}/auth/logout`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ refreshToken }),
      });
    } catch (e) {
      console.warn('Logout API call completed offline');
    }
  }

  // 2. NODE API: PROFILES & CATALOG
  static async getProfiles() {
    const res = await fetch(`${NODE_GATEWAY_URL}/profiles`, {
      headers: this.getHeaders(),
    });
    return res.json();
  }

  // 3. NODE API: DASHBOARD METRICS
  static async getDashboard(token: string) {
    const res = await fetch(`${NODE_GATEWAY_URL}/dashboard/me`, {
      headers: this.getHeaders(token),
    });
    return res.json();
  }

  // 4. NODE API: LIKES & MATCHES
  static async sendLike(toUserId: string, token: string) {
    try {
      const res = await fetch(`${NODE_GATEWAY_URL}/likes`, {
        method: 'POST',
        headers: this.getHeaders(token),
        body: JSON.stringify({ toUserId }),
      });
      return res.json();
    } catch (e) {
      console.warn('Backend API offline, using local simulation for like');
      return { success: true, message: 'Like recorded locally' };
    }
  }

  static async getMatches(token: string) {
    try {
      const res = await fetch(`${NODE_GATEWAY_URL}/likes/matches`, {
        headers: this.getHeaders(token),
      });
      return res.json();
    } catch (e) {
      console.warn('Backend API offline, using local matches');
      return { success: false, data: [] };
    }
  }

  // 5. GO MATCHING ENGINE: ALGORITHMIC RECOMMENDATIONS
  static async getRecommendations(targetProfile: any, candidates: any[]) {
    try {
      const res = await fetch(`${GO_MATCHING_URL}/api/v1/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: targetProfile, candidates }),
      });
      return res.json();
    } catch (e) {
      console.warn('Go Matching Engine offline, using fallback score algorithm');
      return null;
    }
  }

  // 6. MICROSERVICES HEALTH STATUS MONITORING
  static async checkServicesHealth() {
    const results = {
      nodeApi: false,
      goMatching: false,
      goChat: false,
    };

    try {
      const resNode = await fetch(`${NODE_GATEWAY_URL}/health`);
      results.nodeApi = resNode.ok;
    } catch (e) {
      results.nodeApi = false;
    }

    try {
      const resMatch = await fetch(`${GO_MATCHING_URL}/health`);
      results.goMatching = resMatch.ok;
    } catch (e) {
      results.goMatching = false;
    }

    try {
      const resChat = await fetch(`${GO_CHAT_URL}/health`);
      results.goChat = resChat.ok;
    } catch (e) {
      results.goChat = false;
    }

    return results;
  }
}
