import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Box,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Grid,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  IconButton,
  Divider,
  TextField,
} from '@mui/material';
import { 
  Edit as EditIcon,
  Person as PersonIcon 
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { apiClient } from '../../utils/apiClient';
import { RootState } from '../../store';
import { Talent, Scout } from '../../types/api';
import { setCredentials } from '../../store/slices/authSlice';

interface EditScoutForm {
  firstName: string;
  lastName: string;
  email: string;
}

const editSchema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
});

const ScoutDashboard = () => {
  const [error, setError] = useState<string | null>(null);
  const [followedTalents, setFollowedTalents] = useState<Talent[]>([]);
  const [scoutProfile, setScoutProfile] = useState<Scout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { user, token, userRole } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors: formErrors, isSubmitting },
  } = useForm<EditScoutForm>({
    resolver: yupResolver(editSchema),
  });

  useEffect(() => {
    const fetchScoutData = async () => {
      if (!user?.id) {
        setError('Authentication required');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        
        const scoutData = await apiClient.getScoutByUserId(user.id);
        setScoutProfile(scoutData);

        
        if (scoutData.id) {
          const talentsData = await apiClient.getFollowedTalents(scoutData.id);
          setFollowedTalents(talentsData);
        }
      } catch (err: any) {
        console.error('Error fetching scout data:', err);
        if (err.response?.status === 404) {
          setError('Scout profile not found');
        } else if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else if (err.message) {
          setError(err.message);
        } else {
          setError('Failed to load scout data');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchScoutData();
  }, [user?.id]);

  const handleEditProfile = () => {
    if (scoutProfile) {
      reset({
        firstName: scoutProfile.firstName,
        lastName: scoutProfile.lastName,
        email: scoutProfile.email,
      });
      setIsEditDialogOpen(true);
    }
  };

  const onSubmitEdit = async (data: EditScoutForm) => {
    if (!scoutProfile) return;

    try {
      const updatedScout = await apiClient.updateScout(scoutProfile.id, {
        userId: scoutProfile.userId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        followedTalentIds: scoutProfile.followedTalentIds,
      });

      setScoutProfile(updatedScout);
      setIsEditDialogOpen(false);

      
      if (user) {
        const updatedUser = { ...user };
        dispatch(setCredentials({
          token: token || '',
          userRole: userRole || 'SCOUT',
          user: updatedUser
        }));
      }
    } catch (err: any) {
      console.error('Error updating scout profile:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to update profile');
      }
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Scout Profile Section */}
      {scoutProfile && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h4" gutterBottom>
              Scout Profile
            </Typography>
            <IconButton 
              color="primary" 
              onClick={handleEditProfile}
              aria-label="edit profile"
            >
              <EditIcon />
            </IconButton>
          </Box>
          
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}>
                <PersonIcon sx={{ fontSize: 40 }} />
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h5" gutterBottom>
                {scoutProfile.firstName} {scoutProfile.lastName}
              </Typography>
              <Typography color="textSecondary" gutterBottom>
                {scoutProfile.email}
              </Typography>
              <Chip 
                label={`Following ${scoutProfile.followedTalentIds.length} talents`} 
                color="primary" 
                variant="outlined"
              />
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Followed Talents */}
      <Paper sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h5" gutterBottom>
            Followed Talents ({followedTalents.length})
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          {followedTalents.length === 0 ? (
            <Grid item xs={12}>
              <Box textAlign="center" py={4}>
                <Typography color="textSecondary" variant="h6" gutterBottom>
                  No followed talents yet
                </Typography>
                <Typography color="textSecondary">
                  You haven't followed any talents yet. Start building your watchlist by exploring talent profiles.
                </Typography>
              </Box>
            </Grid>
          ) : (
            followedTalents.map((talent) => (
              <Grid item xs={12} sm={6} md={4} key={talent.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={
                      talent.photoPath 
                        ? `http://localhost:8080/uploads/${talent.photoPath}`
                        : '/default-profile.jpg'
                    }
                    alt={`${talent.firstName} ${talent.lastName}`}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {talent.firstName} {talent.lastName}
                    </Typography>
                    <Typography color="textSecondary" gutterBottom>
                      {talent.position}
                    </Typography>
                    {talent.teamName && (
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Team: {talent.teamName}
                      </Typography>
                    )}
                    <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      <Chip
                        label={`Age: ${talent.age}`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={`Goals: ${talent.goals}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        label={`Assists: ${talent.assists}`}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    </Box>
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{ mt: 2 }}
                      onClick={() => window.location.href = `/talent/${talent.id}`}
                    >
                      View Profile
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Paper>

      {/* Edit Profile Dialog */}
      <Dialog 
        open={isEditDialogOpen} 
        onClose={() => setIsEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Scout Profile</DialogTitle>
        <form onSubmit={handleSubmit(onSubmitEdit)}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="firstName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="First Name"
                      error={!!formErrors.firstName}
                      helperText={formErrors.firstName?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="lastName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Last Name"
                      error={!!formErrors.lastName}
                      helperText={formErrors.lastName?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Email"
                      type="email"
                      error={!!formErrors.email}
                      helperText={formErrors.email?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default ScoutDashboard; 