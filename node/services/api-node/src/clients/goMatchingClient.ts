import { logger } from '../utils/logger';

export interface CandidateTargetPayload {
  id: string;
  name?: string;
  gender?: string;
  interests?: string[];
}

export interface IGoMatchingClient {
  calculateScore(target: CandidateTargetPayload, candidate: CandidateTargetPayload): Promise<number>;
  checkHealth(): Promise<boolean>;
}

export class GoMatchingClient implements IGoMatchingClient {
  constructor(private baseUrl: string) {}

  async calculateScore(target: CandidateTargetPayload, candidate: CandidateTargetPayload): Promise<number> {
    try {
      const matchRes = await fetch(`${this.baseUrl}/api/v1/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target,
          candidates: [candidate],
        }),
      });

      const matchData = (await matchRes.json()) as any;
      if (matchData.success && matchData.data && matchData.data.length > 0) {
        return Math.round((matchData.data[0].score || 0.85) * 100);
      }
    } catch (err: any) {
      logger.warn('Go Matching Engine offline or skipped, using fallback score', { error: err?.message || String(err) });
    }
    return 85;
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
