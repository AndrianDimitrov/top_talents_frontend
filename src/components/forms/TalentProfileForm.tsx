import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Button,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
} from '@mui/material';
import { Talent } from '../../types/api';
import { apiClient } from '../../utils/apiClient';

const POSITIONS = ['GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'FORWARD'] as const;
type Position = typeof POSITIONS[number];

type FormValues = {
  firstName: string;
  lastName: string;
  position: Position;
  age: number;
  teamId: number | null;
  photo?: string | null;
};

const schema = yup.object().shape({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  position: yup.string().oneOf([...POSITIONS]).required('Position is required'),
  age: yup.number().required('Age is required').min(5, 'Age must be at least 5').max(100, 'Age must be less than 100'),
  teamId: yup.number().nullable(),
  photo: yup.string().nullable().optional(),
}) as yup.ObjectSchema<FormValues>;

interface TalentProfileFormProps {
  initialData?: Partial<Talent>;
  onSubmit: (data: FormValues) => void;
  isLoading?: boolean;
  error?: string | null;
}

const TalentProfileForm = ({
  initialData,
  onSubmit,
  isLoading = false,
  error = null,
}: TalentProfileFormProps) => {
  const [teams, setTeams] = useState<Array<{ id: number; name: string; city: string; ageGroup: string }>>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);

  useEffect(() => {
    const loadTeams = async () => {
      try {
        const response = await apiClient.getAllTeams();
        setTeams(response);
      } catch (error) {
        console.error('Error loading teams:', error);
      } finally {
        setIsLoadingTeams(false);
      }
    };

    loadTeams();
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      position: (initialData?.position as Position) || 'GOALKEEPER',
      age: initialData?.age || 0,
      teamId: initialData?.teamId ? initialData.teamId : null,
      photo: initialData?.photoPath || null,
    },
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
      <Controller
        name="firstName"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="First Name"
            fullWidth
            margin="normal"
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
            label="Last Name"
            fullWidth
            margin="normal"
            error={!!errors.lastName}
            helperText={errors.lastName?.message}
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
            {errors.position && <FormHelperText>{errors.position.message}</FormHelperText>}
          </FormControl>
        )}
      />

      <Controller
        name="age"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            type="number"
            label="Age"
            fullWidth
            margin="normal"
            error={!!errors.age}
            helperText={errors.age?.message}
          />
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
              value={field.value === null ? '' : field.value}
              onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
            >
              <MenuItem value="">No Team</MenuItem>
              {teams.map((team) => (
                <MenuItem key={team.id} value={team.id}>
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
            {errors.teamId && <FormHelperText>{errors.teamId.message}</FormHelperText>}
          </FormControl>
        )}
      />

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 3 }}
        disabled={isLoading}
      >
        {isLoading ? <CircularProgress size={24} /> : 'Save Profile'}
      </Button>
    </Box>
  );
};

export default TalentProfileForm; 