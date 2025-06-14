import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MatchEvent {
  id: number;
  type: 'goal' | 'assist' | 'yellow_card' | 'red_card' | 'substitution';
  minute: number;
  player: {
    id: number;
    name: string;
  };
  relatedPlayer?: {
    id: number;
    name: string;
  };
  description: string;
}

interface Match {
  id: number;
  date: string;
  time: string;
  homeTeam: {
    id: number;
    name: string;
    logo?: string;
    score: number;
  };
  awayTeam: {
    id: number;
    name: string;
    logo?: string;
    score: number;
  };
  venue: string;
  competition: string;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  events: MatchEvent[];
  stats: {
    possession: { home: number; away: number };
    shots: { home: number; away: number };
    shotsOnTarget: { home: number; away: number };
    passes: { home: number; away: number };
    fouls: { home: number; away: number };
    corners: { home: number; away: number };
  };
}

interface MatchesState {
  matches: Match[];
  selectedMatch: Match | null;
  loading: boolean;
  error: string | null;
}

const initialState: MatchesState = {
  matches: [],
  selectedMatch: null,
  loading: false,
  error: null,
};

const matchesSlice = createSlice({
  name: 'matches',
  initialState,
  reducers: {
    setMatches: (state, action: PayloadAction<Match[]>) => {
      state.matches = action.payload;
      state.loading = false;
      state.error = null;
    },
    setSelectedMatch: (state, action: PayloadAction<Match | null>) => {
      state.selectedMatch = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    addMatch: (state, action: PayloadAction<Match>) => {
      state.matches.push(action.payload);
    },
    updateMatch: (state, action: PayloadAction<Match>) => {
      const index = state.matches.findIndex(m => m.id === action.payload.id);
      if (index !== -1) {
        state.matches[index] = action.payload;
      }
    },
    deleteMatch: (state, action: PayloadAction<number>) => {
      state.matches = state.matches.filter(m => m.id !== action.payload);
    },
  },
});

export const {
  setMatches,
  setSelectedMatch,
  setLoading,
  setError,
  addMatch,
  updateMatch,
  deleteMatch,
} = matchesSlice.actions;

export default matchesSlice.reducer; 