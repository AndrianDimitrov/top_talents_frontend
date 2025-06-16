import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type UserRole = 'TALENT' | 'SCOUT' | 'ADMIN';

interface User {
  id: number;
  email: string;
  userType: UserRole;
  talentId?: number; 
  scoutId?: number; 
}

interface AuthState {
  token: string | null;
  userRole: UserRole | null;
  user: User | null;
  isAuthenticated: boolean;
}


const getInitialState = (): AuthState => {
  try {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole') as UserRole | null;
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    
    if (token && userRole && user && user.id && user.email && user.userType) {
      
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.error('Invalid token format in localStorage');
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('user');
        return {
          token: null,
          userRole: null,
          user: null,
          isAuthenticated: false,
        };
      }

      return {
        token,
        userRole,
        user,
        isAuthenticated: true,
      };
    }
  } catch (error) {
    console.error('Error reading auth state from localStorage:', error);
  }
  
  
  return {
    token: null,
    userRole: null,
    user: null,
    isAuthenticated: false,
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; userRole: UserRole; user: User }>
    ) => {
      console.log('Setting credentials in Redux store:', action.payload);
      
      
      if (!action.payload.token || !action.payload.userRole || !action.payload.user) {
        console.error('Invalid credentials payload:', action.payload);
        return;
      }

      
      const tokenParts = action.payload.token.split('.');
      if (tokenParts.length !== 3) {
        console.error('Invalid token format in payload');
        return;
      }

     
      const userRole = typeof action.payload.userRole === 'object' && 'authority' in action.payload.userRole
        ? (action.payload.userRole as { authority: UserRole }).authority 
        : action.payload.userRole;
      
      state.token = action.payload.token;
      state.userRole = userRole;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      
      
      try {
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('userRole', userRole);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      } catch (error) {
        console.error('Error storing auth state in localStorage:', error);
      }
    },
    logout: (state) => {
      console.log('Logging out, clearing credentials');
      state.token = null;
      state.userRole = null;
      state.user = null;
      state.isAuthenticated = false;
      
      
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('user');
      } catch (error) {
        console.error('Error clearing auth state from localStorage:', error);
      }
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer; 