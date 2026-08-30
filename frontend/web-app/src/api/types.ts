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

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

export interface DashboardMetrics {
  matchesCount: number;
  likesReceivedCount: number;
  averageMatchScore: number;
  profileCompleteness: number;
}

export interface ServiceHealthStatus {
  nodeApi: boolean;
  goMatching: boolean;
  goChat: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
