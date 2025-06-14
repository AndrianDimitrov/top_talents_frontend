import { UserRole } from '../store/slices/authSlice';

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  userType: UserRole;
}

export interface AuthResponse {
  token: string;
}

export interface LoginResponse {
  token: string;
  accessToken?: string;
  user: {
    id: number;
    email: string;
    userType: UserRole;
  };
}

// User types
export interface User {
  id: number;
  email: string;
  userType: UserRole;
  firstName?: string;
  lastName?: string;
  talentId?: number;
  scoutId?: number;
}

// Talent types
export interface Talent {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  age: number;
  position: string;
  teamId: number | null;
  matchesPlayed: number;
  goals: number;
  assists: number;
  cleanSheets: number;
  photoPath?: string;
  matchHistoryIds?: number[];
  teamName?: string;
}

export interface CreateTalentRequest {
  userId: number;
  firstName: string;
  lastName: string;
  age: number;
  position: string;
  teamId: number | null;
  matchesPlayed: number;
  goals: number;
  assists: number;
  cleanSheets: number;
}

export interface UpdateTalentRequest {
  userId: number;
  firstName: string;
  lastName: string;
  age: number;
  position: string;
  teamId: number | null;
  matchesPlayed: number;
  goals: number;
  assists: number;
  cleanSheets: number;
}

// Team types
export interface Team {
  id: number;
  name: string;
  city: string;
  ageGroup: string;
  playerIds?: number[];
}

export interface CreateTeamRequest {
  name: string;
  city: string;
  ageGroup: string;
}

export interface UpdateTeamRequest {
  name: string;
  city: string;
  ageGroup: string;
}

// Match History types
export interface MatchHistory {
  id: number;
  talentId: number;
  matchDate: string;
  opponentTeam: string;
  goals: number;
  assists: number;
  starter: boolean;
  cleanSheet: boolean;
  rating: number;
}

export interface CreateMatchHistoryRequest {
  talentId: number;
  matchDate: string;
  opponentTeam: string;
  goals: number;
  assists: number;
  starter: boolean;
  cleanSheet: boolean;
}

export interface UpdateMatchHistoryRequest {
  matchDate: string;
  opponentTeam: string;
  goals: number;
  assists: number;
  starter: boolean;
  cleanSheet: boolean;
}

// Match Calendar types
export interface MatchCalendar {
  id: number;
  homeTeamId: number;
  guestTeamId: number;
  matchDateTime: string;
  description: string;
}

export interface CreateMatchCalendarRequest {
  homeTeamId: number;
  guestTeamId: number;
  matchDateTime: string;
  description: string;
}

export interface UpdateMatchCalendarRequest {
  matchDateTime: string;
  description: string;
  homeTeamId?: number | null;
  guestTeamId?: number | null;
}

// Scout types
export interface Scout {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  followedTalentIds: number[];
}

export interface CreateScoutRequest {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  followedTalentIds: number[];
}

export interface UpdateScoutRequest {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  followedTalentIds: number[];
}

// File upload types
export interface FileUploadResponse {
  url: string;
}

// Match types
export interface Match {
  id: number;
  homeTeamId: number;
  guestTeamId: number;
  matchDateTime: string;
  description: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  score?: {
    homeTeam: number;
    guestTeam: number;
  };
}

// Scouting Report types
export interface ScoutingReport {
  id: number;
  scoutId: number;
  talentId: number;
  matchId: number;
  reportDate: string;
  technicalRating: number;
  tacticalRating: number;
  physicalRating: number;
  mentalRating: number;
  notes: string;
  recommendation: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
}

export interface CreateScoutingReportRequest {
  scoutId: number;
  talentId: number;
  matchId: number;
  reportDate: string;
  technicalRating: number;
  tacticalRating: number;
  physicalRating: number;
  mentalRating: number;
  notes: string;
  recommendation: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
}

export interface UpdateScoutingReportRequest {
  reportDate: string;
  technicalRating: number;
  tacticalRating: number;
  physicalRating: number;
  mentalRating: number;
  notes: string;
  recommendation: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
}

// Profile types
export interface Profile {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  country?: string;
  bio?: string;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProfileRequest {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  country?: string;
  bio?: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  country?: string;
  bio?: string;
}

export interface ChangePasswordRequest {
  email: string;
  newPassword: string;
  currentPassword?: string;
} 