import React, { useState, useEffect, useRef } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { apiClient } from '../../utils/apiClient';
import { RootState } from '../../store';
import { Team } from '../../types/api';
import { setCredentials } from '../../store/slices/authSlice';
import ScoutOnboardingPage from '../../pages/scout/ScoutOnboardingPage';

interface TalentOnboardingInputs {
  firstName: string;
  lastName: string;
  age: number;
  position: string;
  teamId: string;
}

const POSITIONS = [
  'GOALKEEPER',
  'DEFENDER',
  'MIDFIELDER',
  'FORWARD',
] as const;

const schema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  age: yup
    .number()
    .required('Age is required')
    .min(16, 'Must be at least 16 years old')
    .max(50, 'Must be under 50 years old'),
  position: yup.string().required('Position is required'),
  teamId: yup.string().nullable(),
}).required();

const TalentOnboardingPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const navigate = useNavigate();
  const { userRole, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TalentOnboardingInputs>({
    resolver: yupResolver(schema) as Resolver<TalentOnboardingInputs>,
    defaultValues: {
      firstName: '',
      lastName: '',
      age: 16,
      position: 'GOALKEEPER',
      teamId: '',
    },
  });

  useEffect(() => {
    let isMounted = true;
    let abortController = new AbortController();

    const loadTeams = async () => {
      if (!isMounted) return;
      
      setIsLoadingTeams(true);
      try {
        const teams = await apiClient.getAllTeams(abortController.signal);
        if (isMounted) {
          setTeams(teams && teams.length > 0 ? teams : []);
        }
      } catch (error: any) {
        if (error.name === 'CanceledError' || error.name === 'AbortError') {
          return;
        }
        if (isMounted) {
          setError('Failed to load teams. Please try again later.');
        }
      } finally {
        if (isMounted) setIsLoadingTeams(false);
      }
    };

    loadTeams();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, []);

  const onSubmit = async (data: TalentOnboardingInputs) => {
    try {
      setError(null);
      const storedUser = localStorage.getItem('user');
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;

      if (!parsedUser?.id) {
        throw new Error('User ID not found');
      }

      const requestData = {
        userId: parsedUser.id,
        firstName: data.firstName,
        lastName: data.lastName,
        age: Number(data.age),
        position: data.position,
        teamId: data.teamId ? Number(data.teamId) : null,
        matchesPlayed: 0,
        goals: 0,
        assists: 0,
        cleanSheets: 0
      };

      const response = await apiClient.createTalent(requestData);

      
      const updatedUser = {
        ...parsedUser,
        talentId: response.id
      };

      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      console.log('TalentOnboarding: Updated user in localStorage:', localStorage.getItem('user'));

      
      if (userRole) {
        console.log('TalentOnboarding: Dispatching setCredentials with user:', updatedUser);
        dispatch(setCredentials({
          token: localStorage.getItem('token') || '',
          userRole: userRole,
          user: updatedUser
        }));
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }

      navigate('/talent/dashboard');
    } catch (error: any) {
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('An error occurred while creating your profile');
      }
    }
  };

  if (error) {
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
          <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
            {error}
          </Alert>
          <Button
            variant="contained"
            onClick={() => navigate('/talent/dashboard')}
            sx={{ mt: 2 }}
          >
            Go to Dashboard
          </Button>
        </Box>
      </Container>
    );
  }

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
            name="age"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                margin="normal"
                required
                fullWidth
                type="number"
                label="Age"
                error={!!errors.age}
                helperText={errors.age?.message}
              />
            )}
          />
          <Controller
            name="position"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth margin="normal" error={!!errors.position}>
                <InputLabel>Position</InputLabel>
                <Select {...field} label="Position">
                  {POSITIONS.map((position) => (
                    <MenuItem key={position} value={position}>
                      {position}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
          <Controller
            name="teamId"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth margin="normal" error={!!errors.teamId}>
                <InputLabel>Team</InputLabel>
                <Select
                  {...field}
                  label="Team"
                  disabled={isLoadingTeams}
                >
                  <MenuItem value="">No Team</MenuItem>
                  {teams.map((team) => (
                    <MenuItem key={team.id} value={team.id.toString()}>
                      {team.name} ({team.city}, {team.ageGroup})
                    </MenuItem>
                  ))}
                </Select>
                {isLoadingTeams && (
                  <CircularProgress
                    size={24}
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      marginTop: '-12px',
                      marginLeft: '-12px',
                    }}
                  />
                )}
              </FormControl>
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

export default TalentOnboardingPage; 