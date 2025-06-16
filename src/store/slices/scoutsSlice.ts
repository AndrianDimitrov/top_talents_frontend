import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Scout {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  experience: number;
  specializations: string[];
  activeTalents: number[];
  photoUrl?: string;
  stats: {
    totalReports: number;
    averageRating: number;
    successfulPlacements: number;
  };
}

interface ScoutsState {
  scouts: Scout[];
  selectedScout: Scout | null;
  loading: boolean;
  error: string | null;
}

const initialState: ScoutsState = {
  scouts: [],
  selectedScout: null,
  loading: false,
  error: null,
};

const scoutsSlice = createSlice({
  name: 'scouts',
  initialState,
  reducers: {
    setScouts: (state, action: PayloadAction<Scout[]>) => {
      state.scouts = action.payload;
      state.loading = false;
      state.error = null;
    },
    setSelectedScout: (state, action: PayloadAction<Scout | null>) => {
      state.selectedScout = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    addScout: (state, action: PayloadAction<Scout>) => {
      state.scouts.push(action.payload);
    },
    updateScout: (state, action: PayloadAction<Scout>) => {
      const index = state.scouts.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.scouts[index] = action.payload;
      }
    },
    deleteScout: (state, action: PayloadAction<number>) => {
      state.scouts = state.scouts.filter(s => s.id !== action.payload);
    },
  },
});

export const {
  setScouts,
  setSelectedScout,
  setLoading,
  setError,
  addScout,
  updateScout,
  deleteScout,
} = scoutsSlice.actions;

export default scoutsSlice.reducer; 