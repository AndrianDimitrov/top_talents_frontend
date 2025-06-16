import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateCalendar, DateTimePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import { apiClient } from '../../utils/apiClient';
import { RootState } from '../../store';
import { MatchCalendar, Team, CreateMatchCalendarRequest } from '../../types/api';

interface MatchFormData {
  homeTeamId: string;
  guestTeamId: string;
  matchDateTime: string;
  description: string;
}

const TalentCalendarPage = () => {
  const [error, setError] = useState<string | null>(null);
  const [matches, setMatches] = useState<MatchCalendar[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [formData, setFormData] = useState<MatchFormData>({
    homeTeamId: '',
    guestTeamId: '',
    matchDateTime: '',
    description: '',
  });

  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        setError('Authentication required');
        return;
      }

      setIsLoading(true);

      
      let teamsData = [];
      try {
        teamsData = await apiClient.getAllTeams();
        setTeams(teamsData);
      } catch (err) {
        setTeams([]);
        setError('Failed to load teams');
        setIsLoading(false);
        return;
      }

      
      try {
        const matchesData = await apiClient.getAllMatchCalendar();
        setMatches(matchesData);
      } catch (err: any) {
        console.error('Error fetching matches:', err);
        if (err.response?.status === 404) {
          setMatches([]); 
        } else if (err.response?.status === 403) {
          setError('You do not have permission to view or manage matches. Please contact your administrator.');
          setMatches([]);
        } else if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else if (err.message) {
          setError(err.message);
        } else {
          setError('Failed to load matches');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const handleDateSelect = (date: Date | null) => {
    setSelectedDate(date);
    if (date) {
      setFormData({
        ...formData,
        matchDateTime: date.toISOString(),
      });
      setIsDialogOpen(true);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedDate(null);
  };

  const handleFormSubmit = async () => {
    if (!user?.id) return;

    try {
      const newMatch = await apiClient.createMatchCalendar({
        homeTeamId: Number(formData.homeTeamId),
        guestTeamId: Number(formData.guestTeamId),
        matchDateTime: formData.matchDateTime,
        description: formData.description,
      });
      setMatches([...matches, newMatch]);
      handleDialogClose();
    } catch (err: any) {
      console.error('Error creating match:', err);
      if (err.response?.status === 403) {
        setError('You do not have permission to create matches. Please contact your administrator.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to create match');
      }
    }
  };

  const handleDeleteMatch = async (matchId: number) => {
    try {
      await apiClient.deleteMatchCalendar(matchId);
      setMatches(matches.filter(match => match.id !== matchId));
    } catch (err: any) {
      console.error('Error deleting match:', err);
      if (err.response?.status === 403) {
        setError('You do not have permission to delete matches. Please contact your administrator.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to delete match');
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
      <Paper sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>
          Match Calendar
        </Typography>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateCalendar
            value={selectedDate}
            onChange={handleDateSelect}
            sx={{ width: '100%' }}
          />
        </LocalizationProvider>
      </Paper>

      {/* Upcoming Matches */}
      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Upcoming Matches
        </Typography>
        {matches.length === 0 ? (
          <Typography color="textSecondary">No upcoming matches</Typography>
        ) : (
          matches.map((match) => (
            <Box
              key={match.id}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 1,
                borderBottom: '1px solid #eee',
              }}
            >
              <Box>
                <Typography variant="subtitle1">
                  {format(new Date(match.matchDateTime), 'PPP p')}
                </Typography>
                <Typography>
                  {teams.find(t => t.id === match.homeTeamId)?.name || 'Home'} vs. {teams.find(t => t.id === match.guestTeamId)?.name || 'Guest'}
                </Typography>
                <Typography color="textSecondary">
                  {match.description}
                </Typography>
              </Box>
              {user?.userType === 'ADMIN' && (
                <Button
                  color="error"
                  onClick={() => handleDeleteMatch(match.id)}
                >
                  Delete
                </Button>
              )}
            </Box>
          ))
        )}
      </Paper>

      {/* Add Match Dialog */}
      <Dialog open={isDialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Add New Match</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <FormControl fullWidth margin="normal">
              <DateTimePicker
                label="Match Date & Time"
                value={formData.matchDateTime ? new Date(formData.matchDateTime) : null}
                onChange={(date) => {
                  setFormData({ ...formData, matchDateTime: date ? date.toISOString() : '' });
                }}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </FormControl>
          </LocalizationProvider>
          <FormControl fullWidth margin="normal">
            <InputLabel>Home Team</InputLabel>
            <Select
              value={formData.homeTeamId}
              label="Home Team"
              onChange={(e) => {
                const newHomeTeamId = e.target.value;
                setFormData({ 
                  ...formData, 
                  homeTeamId: newHomeTeamId,
                  guestTeamId: formData.guestTeamId === newHomeTeamId ? '' : formData.guestTeamId
                });
              }}
            >
              {teams.map((team) => (
                <MenuItem key={team.id} value={team.id.toString()}>
                  {team.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Guest Team</InputLabel>
            <Select
              value={formData.guestTeamId}
              label="Guest Team"
              onChange={(e) => setFormData({ ...formData, guestTeamId: e.target.value })}
            >
              {teams
                .filter((team) => team.id.toString() !== formData.homeTeamId)
                .map((team) => (
                  <MenuItem key={team.id} value={team.id.toString()}>
                    {team.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <TextField
            margin="normal"
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleFormSubmit} variant="contained">
            Add Match
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TalentCalendarPage; 