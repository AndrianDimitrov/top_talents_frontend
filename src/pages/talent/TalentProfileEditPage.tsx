import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Container,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { apiClient } from '../../utils/apiClient';
import { RootState } from '../../store';
import { Talent, UpdateTalentRequest } from '../../types/api';
import TalentProfileForm from '../../components/forms/TalentProfileForm';

const TalentProfileEditPage = () => {
  const [talent, setTalent] = useState<Talent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const fetchTalentProfile = async () => {
      if (!user?.id) {
        setError('No user ID');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const talentData = await apiClient.getTalentByUserId(user.id);
        setTalent(talentData);
      } catch (err: any) {
        console.error('Error fetching talent profile:', err);
        if (err.response?.status === 404) {
          setError('Profile not found');
        } else if (err.response?.status === 401 || err.response?.status === 403) {
          setError('You are not authorized to view this profile');
        } else {
          setError('Failed to load profile');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTalentProfile();
  }, [user?.id]);

  const validateUpdateData = (data: any): string | null => {
    if (!data.firstName?.trim()) {
      return 'First name is required';
    }
    if (!data.lastName?.trim()) {
      return 'Last name is required';
    }
    if (!data.position?.trim()) {
      return 'Position is required';
    }
    if (!data.age || data.age < 5 || data.age > 100) {
      return 'Age must be between 5 and 100';
    }
    return null;
  };

  const onSubmit = async (data: any) => {
    if (!talent?.id) {
      setError('No talent profile found');
      return;
    }

    
    if (user?.userType !== 'TALENT' && user?.userType !== 'ADMIN') {
      setError('You are not authorized to update this profile');
      return;
    }

    if (user?.userType === 'TALENT' && user?.id !== talent.userId) {
      setError('You can only update your own profile');
      return;
    }

    
    const validationError = validateUpdateData(data);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      const updateData: UpdateTalentRequest = {
        firstName: data.firstName,
        lastName: data.lastName,
        position: data.position,
        age: Number(data.age),
        teamId: data.teamId,
        matchesPlayed: talent.matchesPlayed,
        goals: talent.goals,
        assists: talent.assists,
        cleanSheets: talent.cleanSheets,
        userId: talent.userId
      };

      console.log('Updating talent with data:', updateData);
      try {
        const updatedTalent = await apiClient.updateTalent(talent.id, updateData);
        setTalent(updatedTalent);
        navigate('/talent/dashboard');
      } catch (err: any) {
        console.error('Error updating profile:', err);
        console.error('Request data:', updateData);
        if (err.response?.data) {
          console.error('Error response:', err.response.data);
        }
        if (err.response?.status === 404) {
          setError('Profile not found or invalid team ID');
        } else if (err.response?.status === 400) {
          setError(err.response.data.message || 'Invalid data provided');
        } else if (err.response?.status === 401 || err.response?.status === 403) {
          setError('You are not authorized to update this profile');
        } else {
          setError('Failed to update profile. Please try again.');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      </Container>
    );
  }

  if (!talent) {
    return (
      <Container>
        <Alert severity="warning" sx={{ mt: 2 }}>No talent profile found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Edit Profile
      </Typography>
      <Box sx={{ border: '1px solid #eee', borderRadius: 2, p: 2, mb: 3, background: '#fafafa' }}>
        <Typography variant="h6">{talent.firstName} {talent.lastName}</Typography>
        <Typography color="textSecondary">Position: {talent.position}</Typography>
        <Typography color="textSecondary">Age: {talent.age}</Typography>
        <Typography color="textSecondary">Team: {talent.teamName ? talent.teamName : 'No team'}</Typography>
      </Box>
      <TalentProfileForm
        initialData={talent}
        onSubmit={onSubmit}
        isLoading={isSubmitting}
        error={error}
      />
    </Container>
  );
};

export default TalentProfileEditPage; 