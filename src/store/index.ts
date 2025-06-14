import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import talentsReducer from './slices/talentsSlice';
import teamsReducer from './slices/teamsSlice';
import matchesReducer from './slices/matchesSlice';
import scoutsReducer from './slices/scoutsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    talents: talentsReducer,
    teams: teamsReducer,
    matches: matchesReducer,
    scouts: scoutsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;