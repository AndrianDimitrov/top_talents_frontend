import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  Paper,
  Stack,
  Avatar,
  useTheme,
  Divider,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';
import {
  SportsSoccer as SoccerIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { setCredentials } from '../../store/slices/authSlice';
import { UserRole } from '../../store/slices/authSlice';
import { apiClient } from '../../utils/apiClient';

interface LoginFormInputs {
  email: string;
  password: string;
}

const schema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

export const Login: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const { mode } = useCustomTheme();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    resolver: yupResolver(schema),
  });

  const handleNavigation = async (userRole: UserRole, userId: number) => {
    try {
      switch (userRole) {
        case 'TALENT':
          try {
            
            const talentProfile = await apiClient.getTalentByUserId(userId);
            if (talentProfile) {
              
              navigate('/talent/dashboard', { replace: true });
            } else {
              
              navigate('/talent/create', { replace: true });
            }
          } catch (error: any) {
            
            if (error.response?.status === 404) {
              navigate('/talent/create', { replace: true });
            } else {
              console.error('Error checking talent profile:', error);
              setError('Error checking profile status');
              
              navigate('/talent/dashboard', { replace: true });
            }
          }
          break;
        case 'SCOUT':
          try {
            const scoutProfile = await apiClient.getScoutByUserId(userId);
            if (scoutProfile) {
              navigate('/scout/dashboard', { replace: true });
            } else {
              navigate('/scout/create', { replace: true });
            }
          } catch (error: any) {
            if (error.response?.status === 404) {
              navigate('/scout/create', { replace: true });
            } else {
              console.error('Error checking scout profile:', error);
              setError('Error checking profile status');
              navigate('/scout/dashboard', { replace: true });
            }
          }
          break;
        case 'ADMIN':
          navigate('/admin/dashboard', { replace: true });
          break;
        default:
          console.error('Unknown user role:', userRole);
          setError('Invalid user role');
          break;
      }
    } catch (error) {
      console.error('Navigation error:', error);
      setError('An error occurred during navigation');
    }
  };

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      setError(null);
      console.log('Sending login request with data:', data);
      const response = await apiClient.login(data);
      console.log('Login response:', response);

      if (response.token && response.user) {
        const userRole = response.user.userType;
        console.log('User role from response:', userRole);

      
        console.log('Dispatching credentials to Redux:', {
          token: response.token,
          userRole: userRole,
          user: response.user
        });
        dispatch(setCredentials({
          token: response.token,
          userRole: userRole,
          user: response.user
        }));
        console.log('Credentials set in Redux store');

        
        localStorage.setItem('token', response.token);
        localStorage.setItem('userRole', userRole);
        localStorage.setItem('user', JSON.stringify(response.user));
        console.log('Credentials stored in localStorage');

        
        console.log('Navigating based on user role:', userRole);
        await handleNavigation(userRole, response.user.id);
      } else {
        setError('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.response?.status === 403) {
        setError('Invalid email or password');
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('An error occurred during login');
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
        }
      }}
    >
      <Container component="main" maxWidth="sm" sx={{ display: 'flex', alignItems: 'center', position: 'relative', zIndex: 1 }}>
        <Paper
          elevation={24}
          sx={{
            width: '100%',
            p: { xs: 3, sm: 5 },
            borderRadius: 4,
            backdropFilter: 'blur(20px)',
            background: mode === 'light' 
              ? 'rgba(255, 255, 255, 0.95)' 
              : 'rgba(26, 26, 26, 0.95)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }}
        >
          <Stack spacing={4} alignItems="center">
            {/* Logo Section */}
            <Box sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <SoccerIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography 
                variant="h3" 
                component="h1" 
                sx={{ 
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}
              >
                TopTalents
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
                Welcome back! Please sign in to your account
              </Typography>
            </Box>

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  width: '100%',
                  borderRadius: 2,
                  '& .MuiAlert-icon': {
                    fontSize: 24
                  }
                }}
              >
                {error}
              </Alert>
            )}

            {/* Login Form */}
            <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  id="email"
                  label="Email Address"
                  autoComplete="email"
                  autoFocus
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: theme.palette.primary.main }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: theme.palette.background.paper,
                      '& fieldset': {
                        borderWidth: 2,
                        borderColor: theme.palette.divider,
                      },
                      '&:hover fieldset': {
                        borderColor: theme.palette.primary.main,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: theme.palette.primary.main,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: theme.palette.text.secondary,
                    },
                    '& .MuiOutlinedInput-input': {
                      color: theme.palette.text.primary,
                    },
                  }}
                  {...register('email')}
                />
                
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: theme.palette.primary.main }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: theme.palette.background.paper,
                      '& fieldset': {
                        borderWidth: 2,
                        borderColor: theme.palette.divider,
                      },
                      '&:hover fieldset': {
                        borderColor: theme.palette.primary.main,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: theme.palette.primary.main,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: theme.palette.text.secondary,
                    },
                    '& .MuiOutlinedInput-input': {
                      color: theme.palette.text.primary,
                    },
                  }}
                  {...register('password')}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isSubmitting}
                  sx={{
                    mt: 3,
                    py: 1.5,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      filter: 'brightness(1.05)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    },
                    '&:disabled': {
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      opacity: 0.7,
                    },
                  }}
                >
                  {isSubmitting ? 'Signing in...' : 'Sign In'}
                </Button>

                <Divider sx={{ my: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    New to TopTalents?
                  </Typography>
                </Divider>

                <Box sx={{ textAlign: 'center' }}>
                  <Link
                    component={RouterLink}
                    to="/register"
                    sx={{
                      textDecoration: 'none',
                      color: theme.palette.primary.main,
                      fontWeight: 600,
                      fontSize: '1rem',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Create your account →
                  </Link>
                </Box>
              </Stack>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login; 