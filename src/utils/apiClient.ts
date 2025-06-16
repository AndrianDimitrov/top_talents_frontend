import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosRequestConfig } from 'axios';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  Talent,
  CreateTalentRequest,
  UpdateTalentRequest,
  Team,
  CreateTeamRequest,
  UpdateTeamRequest,
  MatchHistory,
  CreateMatchHistoryRequest,
  UpdateMatchHistoryRequest,
  MatchCalendar,
  CreateMatchCalendarRequest,
  UpdateMatchCalendarRequest,
  Scout,
  CreateScoutRequest,
  UpdateScoutRequest,
  FileUploadResponse,
  Match,
  ScoutingReport,
  CreateScoutingReportRequest,
  UpdateScoutingReportRequest,
  Profile,
  CreateProfileRequest,
  UpdateProfileRequest,
  User,
  LoginResponse,
  ChangePasswordRequest,
} from '../types/api';
import { UserRole } from '../store/slices/authSlice';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { Button } from '@mui/material';

const API_URL = 'http://localhost:8080/api';

// Add axios interceptor for authentication
axios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  console.log('Making request with token:', token ? 'Token exists' : 'No token');
  
  if (token) {
   
    const formattedToken = token.trim();
    if (formattedToken.split('.').length !== 3) {
      console.error('Invalid token format:', formattedToken);
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return config;
    }
    
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${formattedToken}`;
    config.headers['Content-Type'] = 'application/json';
    config.headers.Accept = 'application/json';
    
    console.log('Request headers:', config.headers);
  }
  return config;
});


axios.interceptors.response.use(
  (response) => {
    console.log('Response received:', {
      status: response.status,
      url: response.config.url,
      method: response.config.method
    });
    return response;
  },
  (error) => {
    console.error('Response error:', {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      message: error.message
    });
    
    
    const isMatchCalendarEndpoint = error.config?.url?.includes('/match-calendars');
    
    if ((error.response?.status === 401 || error.response?.status === 403) && !isMatchCalendarEndpoint) {
      console.log('Auth error, clearing credentials');
      
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('user');
      
     
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

const apiClient = {
  // Auth endpoints
  async register(data: RegisterRequest): Promise<AuthResponse & { user: User }> {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, data, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      

      const authResponse: AuthResponse & { user: User } = {
        token: '', 
        user: {
          email: data.email,
          userType: data.userType,
          id: 0 
        }
      };

      return authResponse;
    } catch (error) {
      console.error('Register error details:', error);
      throw error;
    }
  },

  async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      console.log('Making login request with data:', data);
      const response = await axios.post<{ token: string }>(`${API_URL}/auth/login`, data, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      console.log('Raw login response:', response.data);
      
      if (!response.data || !response.data.token) {
        console.error('No token received from server');
        throw new Error('No token received from server');
      }

      
      const token = response.data.token.trim();
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.error('Invalid token format received from server:', token);
        throw new Error('Invalid token format received from server');
      }

      
      try {
        const tokenData = JSON.parse(atob(tokenParts[1]));
        console.log('Token data:', tokenData);
        
        if (!tokenData || !tokenData.sub || !tokenData.roles || !Array.isArray(tokenData.roles)) {
          console.error('Invalid token data:', tokenData);
          throw new Error('Invalid token data');
        }

        
        const rawRole = tokenData.roles[0]?.authority || 'ROLE_TALENT';
        const userRole = rawRole.startsWith('ROLE_') ? rawRole.slice(5) : rawRole;
        console.log('Extracted user role:', userRole);
        
        
        const userId = tokenData.userId;
        if (!userId) {
          console.error('No user ID found in token data:', tokenData);
          throw new Error('No user ID found in token data');
        }
        
        const user = {
          id: userId,
          email: tokenData.sub,
          userType: userRole as UserRole
        };
        console.log('Created user object:', user);

        const loginResponse = {
          token,
          user
        };
        
        console.log('Processed login response:', loginResponse);
        return loginResponse;
      } catch (e) {
        console.error('Failed to extract user data from token:', e);
        throw new Error('Failed to extract user data from token');
      }
    } catch (error: any) {
      console.error('Login error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      
      const status = error.response?.status;
      if (status === 401 || status === 403) {
        throw new Error('Invalid email or password');
      } else if (status === 500) {
        
        throw new Error('Invalid email or password');
      } else if (status === 404) {
        throw new Error('Login service not available');
      } else if (!error.response) {
        
        throw new Error('Unable to connect to server. Please check your internet connection.');
      } else {
        
        throw new Error('Login failed. Please try again.');
      }
    }
  },

  // Profile endpoints
  async createProfile(data: CreateProfileRequest): Promise<Profile> {
    try {
      console.log('Creating profile with data:', data);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post<Profile>(`${API_URL}/profiles`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      console.log('Profile creation response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating profile:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  async getProfileById(profileId: number): Promise<Profile> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.get<Profile>(`${API_URL}/profiles/${profileId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    return response.data;
  },

  async getProfileByUserId(userId: number): Promise<Profile> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.get<Profile>(`${API_URL}/profiles/user/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    return response.data;
  },

  async updateProfile(profileId: number, data: UpdateProfileRequest): Promise<Profile> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.put<Profile>(`${API_URL}/profiles/${profileId}`, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    return response.data;
  },

  async deleteProfile(profileId: number): Promise<void> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    await axios.delete(`${API_URL}/profiles/${profileId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  },

  // User endpoints
  async getCurrentUser(): Promise<User> {
    const response = await axios.get<User>(`${API_URL}/users/me`);
    return response.data;
  },

  async updateUser(userId: number, data: Partial<User>): Promise<User> {
    const response = await axios.put<User>(`${API_URL}/users/${userId}`, data);
    return response.data;
  },

  async changePassword(userId: number, data: ChangePasswordRequest): Promise<User> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    
    console.log('Attempting password change with PUT to /users/{id}');
    const response = await axios.put<User>(`${API_URL}/users/${userId}`, {
      email: data.email,
      password: data.newPassword,  
      userType: currentUser.userType || 'TALENT'  
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    return response.data;
  },

  // Talent endpoints
  async createTalent(data: CreateTalentRequest): Promise<Talent> {
    try {
      console.log('Creating talent with data:', data);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post<Talent>(`${API_URL}/talents`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      console.log('Talent creation response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating talent:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        requestData: data,
        fullError: error
      });
      throw error;
    }
  },

  async uploadTalentPhoto(talentId: number, file: File): Promise<string> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await axios.post<FileUploadResponse>(`${API_URL}/talents/${talentId}/photo`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        transformRequest: [(data) => data], 
      });
      return response.data.url;
    } catch (error: any) {
      console.error('Error uploading photo:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  async getTalentById(id: number): Promise<Talent> {
    const response = await axios.get<Talent>(`${API_URL}/talents/${id}`);
    return response.data;
  },

  async getTalentByUserId(userId: number, signal?: AbortSignal): Promise<Talent> {
    try {
      const response = await axios.get<Talent>(`${API_URL}/talents/user/${userId}`, {
        signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw error;
      }
      console.error('Error fetching talent by user ID:', error);
      throw error;
    }
  },

  async getAllTalents(): Promise<Talent[]> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      console.log('Fetching talents from API endpoint: /api/talents');
      const response = await axios.get<Talent[]>(`${API_URL}/talents`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      console.log(`Successfully fetched ${response.data.length} talents from real API`);
      return response.data;
    } catch (error: any) {
      
      if (error.response?.status === 405) {
        console.warn('Talents endpoint still returns 405, using mock data fallback');
        throw error;
      }
      
      console.error('Error fetching all talents:', error);
      throw error;
    }
  },

  async searchTalents(filters?: {
    ageGroup?: string;
    position?: string;
    team?: string;
  }): Promise<Talent[]> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      
      const allTalents = await this.getAllTalents();
      
      if (!filters) {
        return allTalents;
      }

      return allTalents.filter(talent => {
        
        if (filters.ageGroup && filters.ageGroup !== '') {
          let ageMatches = false;
          switch (filters.ageGroup) {
            case 'U18':
              ageMatches = talent.age < 18;
              break;
            case 'U21':
              ageMatches = talent.age < 21;
              break;
            case 'U23':
              ageMatches = talent.age < 23;
              break;
            case 'SENIOR':
              ageMatches = talent.age >= 23;
              break;
            default:
              ageMatches = true;
          }
          if (!ageMatches) return false;
        }

        
        if (filters.position && filters.position !== '' && talent.position !== filters.position) {
          return false;
        }

        
        if (filters.team && filters.team !== '') {
          const teamMatch = talent.teamName?.toLowerCase().includes(filters.team.toLowerCase());
          if (!teamMatch) return false;
        }

        return true;
      });
    } catch (error: any) {
      
      if (error.response?.status === 405) {
        console.warn('Talents endpoint not available (405), falling back to mock data');
        return this.getMockTalentsData(filters);
      }
      console.error('Error in searchTalents:', error);
      throw error;
    }
  },

  
  getMockTalentsData(filters?: {
    ageGroup?: string;
    position?: string;
    team?: string;
  }): Talent[] {
    const mockTalents: Talent[] = [
      {
        id: 1,
        userId: 1,
        firstName: 'John',
        lastName: 'Smith',
        age: 19,
        position: 'FORWARD',
        teamId: 1,
        matchesPlayed: 25,
        goals: 12,
        assists: 8,
        cleanSheets: 0,
        teamName: 'Barcelona Youth'
      },
      {
        id: 2,
        userId: 2,
        firstName: 'Maria',
        lastName: 'Garcia',
        age: 17,
        position: 'MIDFIELDER',
        teamId: 2,
        matchesPlayed: 22,
        goals: 5,
        assists: 15,
        cleanSheets: 0,
        teamName: 'Real Madrid Academy'
      },
      {
        id: 3,
        userId: 3,
        firstName: 'Alex',
        lastName: 'Johnson',
        age: 20,
        position: 'DEFENDER',
        teamId: 3,
        matchesPlayed: 28,
        goals: 2,
        assists: 4,
        cleanSheets: 12,
        teamName: 'Manchester United Youth'
      },
      {
        id: 4,
        userId: 4,
        firstName: 'Emma',
        lastName: 'Wilson',
        age: 18,
        position: 'GOALKEEPER',
        teamId: 4,
        matchesPlayed: 30,
        goals: 0,
        assists: 1,
        cleanSheets: 18,
        teamName: 'Chelsea FC Academy'
      },
      {
        id: 5,
        userId: 5,
        firstName: 'Carlos',
        lastName: 'Rodriguez',
        age: 21,
        position: 'MIDFIELDER',
        teamId: 5,
        matchesPlayed: 26,
        goals: 8,
        assists: 12,
        cleanSheets: 0,
        teamName: 'AC Milan Youth'
      },
      {
        id: 6,
        userId: 6,
        firstName: 'Sophie',
        lastName: 'Brown',
        age: 16,
        position: 'FORWARD',
        teamId: 6,
        matchesPlayed: 20,
        goals: 18,
        assists: 6,
        cleanSheets: 0,
        teamName: 'Bayern Munich Youth'
      }
    ];

    if (!filters) {
      return mockTalents;
    }

    return mockTalents.filter(talent => {
      
      if (filters.ageGroup && filters.ageGroup !== '') {
        let ageMatches = false;
        switch (filters.ageGroup) {
          case 'U18':
            ageMatches = talent.age < 18;
            break;
          case 'U21':
            ageMatches = talent.age < 21;
            break;
          case 'U23':
            ageMatches = talent.age < 23;
            break;
          case 'SENIOR':
            ageMatches = talent.age >= 23;
            break;
          default:
            ageMatches = true;
        }
        if (!ageMatches) return false;
      }

      
      if (filters.position && filters.position !== '' && talent.position !== filters.position) {
        return false;
      }

      
      if (filters.team && filters.team !== '') {
        const teamMatch = talent.teamName?.toLowerCase().includes(filters.team.toLowerCase());
        if (!teamMatch) return false;
      }

      return true;
    });
  },

  async updateTalent(talentId: number, data: UpdateTalentRequest): Promise<Talent> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.put<Talent>(`${API_URL}/talents/${talentId}`, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    return response.data;
  },

  async deleteTalent(talentId: number): Promise<void> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    await axios.delete(`${API_URL}/talents/${talentId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  },

  // Team endpoints
  async createTeam(data: CreateTeamRequest): Promise<Team> {
    const response = await axios.post<Team>(`${API_URL}/teams`, data);
    return response.data;
  },

  async getTeamById(teamId: number): Promise<Team> {
    const response = await axios.get<Team>(`${API_URL}/teams/${teamId}`);
    return response.data;
  },

  async getAllTeams(signal?: AbortSignal): Promise<Team[]> {
    console.log('Fetching teams...');
    try {
      const response = await axios.get<Team[]>(`${API_URL}/teams`, {
        signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`        }
      });
      console.log('Teams response:', response.data);
      return response.data;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw error;
      }
      console.error('Error fetching teams:', error);
      throw error;
    }
  },

  async updateTeam(teamId: number, data: UpdateTeamRequest): Promise<Team> {
    const response = await axios.put<Team>(`${API_URL}/teams/${teamId}`, data);
    return response.data;
  },

  async deleteTeam(teamId: number): Promise<void> {
    await axios.delete(`${API_URL}/teams/${teamId}`);
  },

  // Match History endpoints
  async createMatchHistory(data: CreateMatchHistoryRequest): Promise<MatchHistory> {
    const response = await axios.post<MatchHistory>(`${API_URL}/match-history`, data);
    return response.data;
  },

  async getMatchHistoryById(historyId: number): Promise<MatchHistory> {
    const response = await axios.get<MatchHistory>(`${API_URL}/match-history/${historyId}`);
    return response.data;
  },

  async getAllMatchHistory(): Promise<MatchHistory[]> {
    const response = await axios.get<MatchHistory[]>(`${API_URL}/match-history`);
    return response.data;
  },

  async getMatchHistoryByTalent(talentId: number): Promise<MatchHistory[]> {
    const response = await axios.get<MatchHistory[]>(`${API_URL}/match-history/by-talent/${talentId}`);
    return response.data;
  },

  async updateMatchHistory(historyId: number, data: UpdateMatchHistoryRequest & { talentId: number }): Promise<MatchHistory> {
    console.log('Updating match history with:', {
      talentId: data.talentId,
      matchDate: data.matchDate,
      opponentTeam: data.opponentTeam,
      goals: Number(data.goals),
      assists: Number(data.assists),
      starter: data.starter,
      cleanSheet: data.cleanSheet,
    });
    const response = await axios.put<MatchHistory>(
      `${API_URL}/match-history/${historyId}`,
      {
        talentId: data.talentId,
        matchDate: data.matchDate,
        opponentTeam: data.opponentTeam,
        goals: Number(data.goals),
        assists: Number(data.assists),
        starter: data.starter,
        cleanSheet: data.cleanSheet,
      }
    );
    return response.data;
  },

  async deleteMatchHistory(historyId: number): Promise<void> {
    await axios.delete(`${API_URL}/match-history/${historyId}`);
  },

  // Match Calendar endpoints
  async createMatchCalendar(data: CreateMatchCalendarRequest): Promise<MatchCalendar> {
    const response = await axios.post<MatchCalendar>(`${API_URL}/match-calendars`, data);
    return response.data;
  },

  async getMatchCalendarById(calendarId: number): Promise<MatchCalendar> {
    const response = await axios.get<MatchCalendar>(`${API_URL}/match-calendars/${calendarId}`);
    return response.data;
  },

  async getAllMatchCalendar(): Promise<MatchCalendar[]> {
    const response = await axios.get<MatchCalendar[]>(`${API_URL}/match-calendars`);
    return response.data;
  },

  async getMatchCalendarByDateRange(start: string, end: string): Promise<MatchCalendar[]> {
    const response = await axios.get<MatchCalendar[]>(`${API_URL}/match-calendars/date-range`, {
      params: { start, end },
    });
    return response.data;
  },

  async getMatchCalendarByTeam(teamId: number): Promise<MatchCalendar[]> {
    const response = await axios.get<MatchCalendar[]>(`${API_URL}/match-calendars/team/${teamId}`);
    return response.data;
  },

  async updateMatchCalendar(calendarId: number, data: UpdateMatchCalendarRequest): Promise<MatchCalendar> {
    const response = await axios.put<MatchCalendar>(`${API_URL}/match-calendars/${calendarId}`, data);
    return response.data;
  },

  async deleteMatchCalendar(calendarId: number): Promise<void> {
    await axios.delete(`${API_URL}/match-calendars/${calendarId}`);
  },

  // Scout endpoints
  async createScout(data: CreateScoutRequest): Promise<Scout> {
    const response = await axios.post<Scout>(`${API_URL}/scouts`, data);
    return response.data;
  },

  async getScoutById(scoutId: number): Promise<Scout> {
    const response = await axios.get<Scout>(`${API_URL}/scouts/${scoutId}`);
    return response.data;
  },

  async getAllScouts(): Promise<Scout[]> {
    const response = await axios.get<Scout[]>(`${API_URL}/scouts`);
    return response.data;
  },

  async updateScout(scoutId: number, data: UpdateScoutRequest): Promise<Scout> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.put<Scout>(`${API_URL}/scouts/${scoutId}`, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    return response.data;
  },

  async deleteScout(scoutId: number): Promise<void> {
    await axios.delete(`${API_URL}/scouts/${scoutId}`);
  },

  async getFollowedTalents(scoutId: number): Promise<Talent[]> {
    const response = await axios.get<Talent[]>(`${API_URL}/scouts/${scoutId}/followed-talents`);
    return response.data;
  },

  async followTalent(scoutId: number, talentId: number): Promise<Scout> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.post<Scout>(`${API_URL}/scouts/${scoutId}/followed-talents`, 
      [talentId], // Send as array of talent IDs
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );
    return response.data; 
  },

  async unfollowTalent(scoutId: number, talentId: number): Promise<Scout> {
    
    const scout = await this.getScoutById(scoutId);
    
    
    const updatedFollowedTalentIds = scout.followedTalentIds.filter(id => id !== talentId);
    
    
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.post<Scout>(`${API_URL}/scouts/${scoutId}/followed-talents`, 
      updatedFollowedTalentIds, 
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );
    return response.data; 
  },

  async getScoutByUserId(userId: number, signal?: AbortSignal): Promise<Scout> {
    try {
      const response = await axios.get<Scout>(`${API_URL}/scouts/user/${userId}`, {
        signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`        }
      });
      return response.data;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw error;
      }
      console.error('Error fetching scout by user ID:', error);
      throw error;
    }
  },

  // Scouting Report endpoints
  async createScoutingReport(data: CreateScoutingReportRequest): Promise<ScoutingReport> {
    const response = await axios.post<ScoutingReport>(`${API_URL}/scouting-reports`, data);
    return response.data;
  },

  async getScoutingReportById(reportId: number): Promise<ScoutingReport> {
    const response = await axios.get<ScoutingReport>(`${API_URL}/scouting-reports/${reportId}`);
    return response.data;
  },

  async getScoutingReportsByScout(scoutId: number): Promise<ScoutingReport[]> {
    const response = await axios.get<ScoutingReport[]>(`${API_URL}/scouting-reports/scout/${scoutId}`);
    return response.data;
  },

  async getScoutingReportsByTalent(talentId: number): Promise<ScoutingReport[]> {
    const response = await axios.get<ScoutingReport[]>(`${API_URL}/scouting-reports/talent/${talentId}`);
    return response.data;
  },

  async updateScoutingReport(reportId: number, data: UpdateScoutingReportRequest): Promise<ScoutingReport> {
    const response = await axios.put<ScoutingReport>(`${API_URL}/scouting-reports/${reportId}`, data);
    return response.data;
  },

  async deleteScoutingReport(reportId: number): Promise<void> {
    await axios.delete(`${API_URL}/scouting-reports/${reportId}`);
  },

  // Admin endpoints
  async getAllUsers(): Promise<User[]> {
    const response = await axios.get<User[]>(`${API_URL}/users`);
    return response.data;
  },

  async createUser(data: Partial<User>): Promise<User> {
    const response = await axios.post<User>(`${API_URL}/users`, data);
    return response.data;
  },

  async deleteUser(userId: number): Promise<void> {
    await axios.delete(`${API_URL}/users/${userId}`);
  },

  async getSystemStats(): Promise<{
    userCount: number;
    talentCount: number;
    scoutCount: number;
    teamCount: number;
    scheduledMatchCount: number;
    matchHistoryCount: number;
  }> {
    const response = await axios.get(`${API_URL}/admin/stats`);
    return response.data;
  },

  async createBackup(name: string): Promise<void> {
    await axios.post(`${API_URL}/admin/backups`, { name });
  },

  async restoreBackup(backupId: number): Promise<void> {
    await axios.post(`${API_URL}/admin/backups/${backupId}/restore`);
  },

  async uploadFile(formData: FormData): Promise<FileUploadResponse> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await axios.post<FileUploadResponse>(`${API_URL}/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        transformRequest: [(data) => data], 
      });
      return response.data;
    } catch (error: any) {
      console.error('Error uploading file:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },
};

export { apiClient };

