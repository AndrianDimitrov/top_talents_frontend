import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Stack,
  Avatar,
  useTheme,
  Divider,
  IconButton,
  InputAdornment,
  Chip,
} from '@mui/material';
import {
  SportsSoccer as SoccerIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  PersonAdd as PersonAddIcon,
  Sports as SportsIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { setCredentials } from '../../store/slices/authSlice';
import { UserRole } from '../../store/slices/authSlice';
import { apiClient } from '../../utils/apiClient';
import { RegisterRequest } from '../../types/api';

interface RegisterFormInputs {
  email: string;
  password: string;
  confirmPassword: string;
  userType: UserRole;
}

const schema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required('Confirm password is required'),
  userType: yup.mixed<UserRole>().oneOf(['TALENT', 'SCOUT'] as const).required('User type is required'),
});

const Register = () => {
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    watch,
  } = useForm<RegisterFormInputs>({
    resolver: yupResolver(schema),
    defaultValues: {
      userType: 'TALENT',
    },
  });

  const selectedUserType = watch('userType');

  const onSubmit = async (data: RegisterFormInputs) => {
    try {
      setError(null);
      console.log('Starting registration process...');
      
      const registerRequest: RegisterRequest = {
        email: data.email,
        password: data.password,
        userType: data.userType,
      };
      
      console.log('Sending registration request...');
      await apiClient.register(registerRequest);
      
      
      console.log('Registration successful, attempting login...');
      const loginResponse = await apiClient.login({
        email: data.email,
        password: data.password
      });
      
      if (!loginResponse || !loginResponse.token) {
        throw new Error('Login failed after registration');
      }

      console.log('Login successful, setting credentials...');
      dispatch(setCredentials({ 
        token: loginResponse.token, 
        userRole: loginResponse.user.userType, 
        user: loginResponse.user 
      }));

      localStorage.setItem('token', loginResponse.token);
      localStorage.setItem('userRole', loginResponse.user.userType);
      localStorage.setItem('user', JSON.stringify(loginResponse.user));
      
      console.log('Credentials set, redirecting to onboarding...');
      if (loginResponse.user.userType === 'TALENT') {
        navigate('/talent/create', { replace: true });
      } else {
        navigate('/scout/create', { replace: true });
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      if (err.response?.status === 409) {
        setError('This email address is already registered. Please use a different email or try logging in.');
      } else if (err.message === 'No data received from server') {
        setError('Server returned an empty response. Please try again.');
      } else if (err.message === 'No token received from server') {
        setError('Authentication failed. Please try again.');
      } else if (err.message === 'No user data received from server') {
        setError('User data is missing. Please try again.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('An error occurred during registration');
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
          background: 'radial-gradient(circle at 70% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 30% 70%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
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
            background: 'rgba(255, 255, 255, 0.95)',
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
                Join the TopTalents community today
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

            {/* Registration Form */}
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
                      '& fieldset': {
                        borderWidth: 2,
                      },
                      '&:hover fieldset': {
                        borderColor: theme.palette.primary.main,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: theme.palette.primary.main,
                      },
                    },
                  }}
                  {...register('email')}
                />

                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="new-password"
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
                      '& fieldset': {
                        borderWidth: 2,
                      },
                      '&:hover fieldset': {
                        borderColor: theme.palette.primary.main,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: theme.palette.primary.main,
                      },
                    },
                  }}
                  {...register('password')}
                />

                <TextField
                  fullWidth
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  autoComplete="new-password"
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: theme.palette.primary.main }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle confirm password visibility"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '& fieldset': {
                        borderWidth: 2,
                      },
                      '&:hover fieldset': {
                        borderColor: theme.palette.primary.main,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: theme.palette.primary.main,
                      },
                    },
                  }}
                  {...register('confirmPassword')}
                />

                <FormControl 
                  fullWidth 
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '& fieldset': {
                        borderWidth: 2,
                      },
                      '&:hover fieldset': {
                        borderColor: theme.palette.primary.main,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: theme.palette.primary.main,
                      },
                    },
                  }}
                >
                  <InputLabel id="user-type-label">I want to join as</InputLabel>
                  <Controller
                    name="userType"
                    control={control}
                    render={({ field }) => (
                      <Select
                        labelId="user-type-label"
                        id="userType"
                        label="I want to join as"
                        startAdornment={
                          <InputAdornment position="start">
                            <PersonAddIcon sx={{ color: theme.palette.primary.main }} />
                          </InputAdornment>
                        }
                        {...field}
                      >
                        <MenuItem value="TALENT">
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <SportsIcon sx={{ color: theme.palette.success.main }} />
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                Talent
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Showcase your football skills
                              </Typography>
                            </Box>
                          </Stack>
                        </MenuItem>
                        <MenuItem value="SCOUT">
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <SearchIcon sx={{ color: theme.palette.info.main }} />
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                Scout
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Discover new football talents
                              </Typography>
                            </Box>
                          </Stack>
                        </MenuItem>
                      </Select>
                    )}
                  />
                </FormControl>

                {/* User Type Info */}
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  background: selectedUserType === 'TALENT' 
                    ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)'
                    : 'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%)',
                  border: `1px solid ${selectedUserType === 'TALENT' ? theme.palette.success.main : theme.palette.info.main}20`
                }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    {selectedUserType === 'TALENT' ? (
                      <SportsIcon sx={{ color: theme.palette.success.main }} />
                    ) : (
                      <SearchIcon sx={{ color: theme.palette.info.main }} />
                    )}
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {selectedUserType === 'TALENT' ? 'Football Talent' : 'Talent Scout'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {selectedUserType === 'TALENT' 
                          ? 'Create your profile, showcase skills, and connect with scouts'
                          : 'Discover promising talents and build your scouting network'
                        }
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

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
                  {isSubmitting ? 'Creating your account...' : 'Create Account'}
                </Button>

                <Divider sx={{ my: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Already have an account?
                  </Typography>
                </Divider>

                <Box sx={{ textAlign: 'center' }}>
                  <Link
                    component={RouterLink}
                    to="/login"
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
                    Sign in to your account →
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

export default Register; 