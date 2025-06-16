import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Player {
  id: number;
  firstName: string;
  lastName: string;
  position: string;
  number: number;
  age: number;
  nationality: string;
  photoUrl?: string;
}

interface Team {
  id: number;
  name: string;
  country: string;
  city: string;
  founded: number;
  stadium: string;
  capacity: number;
  logo?: string;
  players: Player[];
  stats: {
    matchesPlayed: number;
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
    points: number;
  };
}

interface TeamsState {
  teams: Team[];
  selectedTeam: Team | null;
  loading: boolean;
  error: string | null;
}

const initialState: TeamsState = {
  teams: [],
  selectedTeam: null,
  loading: false,
  error: null,
};

const teamsSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {
    setTeams: (state, action: PayloadAction<Team[]>) => {
      state.teams = action.payload;
      state.loading = false;
      state.error = null;
    },
    setSelectedTeam: (state, action: PayloadAction<Team | null>) => {
      state.selectedTeam = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    addTeam: (state, action: PayloadAction<Team>) => {
      state.teams.push(action.payload);
    },
    updateTeam: (state, action: PayloadAction<Team>) => {
      const index = state.teams.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.teams[index] = action.payload;
      }
    },
    deleteTeam: (state, action: PayloadAction<number>) => {
      state.teams = state.teams.filter(t => t.id !== action.payload);
    },
  },
});

export const {
  setTeams,
  setSelectedTeam,
  setLoading,
  setError,
  addTeam,
  updateTeam,
  deleteTeam,
} = teamsSlice.actions;

export default teamsSlice.reducer; 