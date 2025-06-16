import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useForm, Controller, Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
} from '@mui/material';
import { apiClient } from '../../utils/apiClient';
import { RootState } from '../../store';
import { setCredentials } from '../../store/slices/authSlice';

interface ScoutOnboardingInputs {
  firstName: string;
  lastName: string;
  email: string;
}

const schema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
}).required();

const ScoutOnboardingPage = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token, userRole } = useSelector((state: RootState) => state.auth);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ScoutOnboardingInputs>({
    resolver: yupResolver(schema) as Resolver<ScoutOnboardingInputs>,
  });

  const onSubmit = async (data: ScoutOnboardingInputs) => {
    if (!user?.id || !token) {
      setError('Authentication required. Please log in again.');
      navigate('/login');
      return;
    }

    try {
      const newScout = await apiClient.createScout({
        userId: user.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        followedTalentIds: [], // Empty array by default
      });

      console.log('Scout created successfully:', newScout);

      
      const updatedUser = {
        ...user,
        scoutId: newScout.id
      };

      
      localStorage.setItem('user', JSON.stringify(updatedUser));

      
      dispatch(setCredentials({
        token: token,
        userRole: userRole || 'SCOUT',
        user: updatedUser
      }));

      
      navigate('/scout/dashboard');
    } catch (err: any) {
      console.error('Profile creation error:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('An error occurred while creating your profile');
      }
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Complete Your Profile
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
          <Controller
            name="firstName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                margin="normal"
                required
                fullWidth
                label="First Name"
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
              />
            )}
          />
          <Controller
            name="lastName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                margin="normal"
                required
                fullWidth
                label="Last Name"
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
              />
            )}
          />
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                margin="normal"
                required
                fullWidth
                label="Email Address"
                autoComplete="email"
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            )}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Profile...' : 'Create Profile'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ScoutOnboardingPage; 