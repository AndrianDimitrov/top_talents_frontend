import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Avatar,
} from '@mui/material';
import {
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
  CalendarToday as CalendarIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { apiClient } from '../../utils/apiClient';
import { RootState } from '../../store';
import { Talent, Team } from '../../types/api';

const TalentDashboard = () => {
  const [talent, setTalent] = useState<Talent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const fetchTalentProfile = useCallback(async () => {
    if (!user?.id) {
      setError('No user ID');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const talentData = await apiClient.getTalentByUserId(user.id);
      console.log('TalentDashboard: API response', talentData);
      setTalent(talentData);
    } catch (err: any) {
      console.error('TalentDashboard: API error', err);
      setError('Failed to load profile');
      setTalent(null);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchTalentProfile();
  }, [fetchTalentProfile]);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !talent) return;

    try {
      const photoUrl = await apiClient.uploadTalentPhoto(talent.id, file);
      setTalent(prev => prev ? { ...prev, photoPath: photoUrl } : null);
    } catch (err: any) {
      console.error('Error uploading photo:', err);
      setError('Failed to upload photo');
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <Box sx={{ position: 'relative', p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Avatar
                  src={talent.photoPath ? `http://localhost:8080/uploads/${talent.photoPath}` : '/default-avatar.png'}
                  sx={{ width: 150, height: 150 }}
                />
              </Box>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="photo-upload"
                type="file"
                onChange={handlePhotoUpload}
              />
              <label htmlFor="photo-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<PhotoCameraIcon />}
                  fullWidth
                >
                  Upload Photo
                </Button>
              </label>
            </Box>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                {talent.firstName} {talent.lastName}
              </Typography>
              <Typography color="textSecondary" gutterBottom>
                Position: {talent.position}
              </Typography>
              <Typography color="textSecondary" gutterBottom>
                Age: {talent.age}
              </Typography>
              <Typography color="textSecondary" gutterBottom>
                Team: {talent.teamName ? talent.teamName : 'No team'}
              </Typography>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => navigate('/talent/profile/edit')}
              >
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Stats Cards */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Matches Played
                  </Typography>
                  <Typography variant="h4">
                    {talent.matchesPlayed}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Goals
                  </Typography>
                  <Typography variant="h4">
                    {talent.goals}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Assists
                  </Typography>
                  <Typography variant="h4">
                    {talent.assists}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Clean Sheets
                  </Typography>
                  <Typography variant="h4">
                    {talent.cleanSheets}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Quick Actions */}
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Button
                  variant="outlined"
                  startIcon={<CalendarIcon />}
                  fullWidth
                  onClick={() => navigate('/talent/calendar')}
                >
                  View Match Calendar
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  variant="outlined"
                  startIcon={<HistoryIcon />}
                  fullWidth
                  onClick={() => navigate('/talent/history')}
                >
                  View Match History
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default TalentDashboard; 