export type Gender = 'male' | 'female' | 'non_binary' | 'other';
export type RelationshipGoal = 'marriage' | 'serious_relationship' | 'casual' | 'friendship';

export interface Location {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
}

export interface Photo {
  id: string;
  userId: string;
  url: string;
  isPrimary: boolean;
  width?: number;
  height?: number;
  createdAt: string;
}

export interface UserPreferences {
  minAge: number;
  maxAge: number;
  maxDistanceKm: number;
  preferredGenders: Gender[];
  relationshipGoals: RelationshipGoal[];
}

export interface UserProfile {
  id: string;
  userId: string;
  name: string;
  age: number;
  gender: Gender;
  city: string;
  location: Location;
  education: string;
  profession: string;
  relationshipGoal: RelationshipGoal;
  bio: string;
  interests: string[];
  languages: string[];
  hobbies: string[];
  foodPreferences: string[];
  musicInterests: string[];
  photos: Photo[];
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  phoneNumber?: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Like {
  id: string;
  fromUserId: string;
  toUserId: string;
  createdAt: string;
}

export interface Match {
  id: string;
  userAId: string;
  userBId: string;
  matchedAt: string;
  isActive: boolean;
}

export interface ChatMessage {
  id: string;
  matchId: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: number;
  read: boolean;
}

export interface JaccardBreakdown {
  interests: number;
  languages: number;
  hobbies: number;
  foodPreferences: number;
  musicInterests: number;
  compositeJaccard: number;
}

export interface MatchCandidate {
  userId: string;
  name: string;
  age: number;
  city: string;
  photos: Photo[];
  score: number; // 0.0 to 1.0
  matchPercentage: number; // 0 to 100
  jaccardBreakdown: JaccardBreakdown;
  distanceKm: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
