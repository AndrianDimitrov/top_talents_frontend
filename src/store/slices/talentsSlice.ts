import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Talent {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  age: number;
  height: number;
  weight: number;
  rating: number;
  team?: string;
  skills: string[];
  photoUrl?: string;
}

interface TalentsState {
  talents: Talent[];
  selectedTalent: Talent | null;
  loading: boolean;
  error: string | null;
}

const initialState: TalentsState = {
  talents: [],
  selectedTalent: null,
  loading: false,
  error: null,
};

const talentsSlice = createSlice({
  name: 'talents',
  initialState,
  reducers: {
    setTalents: (state, action: PayloadAction<Talent[]>) => {
      state.talents = action.payload;
      state.loading = false;
      state.error = null;
    },
    setSelectedTalent: (state, action: PayloadAction<Talent | null>) => {
      state.selectedTalent = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    addTalent: (state, action: PayloadAction<Talent>) => {
      state.talents.push(action.payload);
    },
    updateTalent: (state, action: PayloadAction<Talent>) => {
      const index = state.talents.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.talents[index] = action.payload;
      }
    },
    deleteTalent: (state, action: PayloadAction<number>) => {
      state.talents = state.talents.filter(t => t.id !== action.payload);
    },
  },
});

export const {
  setTalents,
  setSelectedTalent,
  setLoading,
  setError,
  addTalent,
  updateTalent,
  deleteTalent,
} = talentsSlice.actions;

export default talentsSlice.reducer; 