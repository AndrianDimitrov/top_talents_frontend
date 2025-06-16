import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Alert,
  CircularProgress,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Stack,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CalendarToday as CalendarIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { apiClient } from '../../utils/apiClient';
import { MatchCalendar, Team } from '../../types/api';

interface MatchFormData {
  homeTeamId: string;
  guestTeamId: string;
  matchDateTime: string;
  description: string;
}

const MatchCalendarManagement = () => {
  const [matches, setMatches] = useState<MatchCalendar[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<MatchCalendar | null>(null);
  
  const [formData, setFormData] = useState<MatchFormData>({
    homeTeamId: '',
    guestTeamId: '',
    matchDateTime: '',
    description: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [matchesData, teamsData] = await Promise.all([
        apiClient.getAllMatchCalendar(),
        apiClient.getAllTeams(),
      ]);
      setMatches(matchesData);
      setTeams(teamsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      homeTeamId: '',
      guestTeamId: '',
      matchDateTime: '',
      description: '',
    });
  };

  const handleCreateMatch = async () => {
    try {
      const newMatch = await apiClient.createMatchCalendar({
        homeTeamId: Number(formData.homeTeamId),
        guestTeamId: Number(formData.guestTeamId),
        matchDateTime: formData.matchDateTime,
        description: formData.description,
      });
      setMatches([...matches, newMatch]);
      setIsCreateDialogOpen(false);
      resetForm();
      setSuccess('Match created successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to create match');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleEditMatch = async () => {
    if (!editingMatch) return;
    
    try {
      const updatedMatch = await apiClient.updateMatchCalendar(editingMatch.id, {
        matchDateTime: formData.matchDateTime,
        description: formData.description,
        homeTeamId: Number(formData.homeTeamId),
        guestTeamId: Number(formData.guestTeamId),
      });
      setMatches(matches.map(match => 
        match.id === editingMatch.id ? updatedMatch : match
      ));
      setIsEditDialogOpen(false);
      setEditingMatch(null);
      resetForm();
      setSuccess('Match updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update match');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleDeleteMatch = async (matchId: number) => {
    if (!window.confirm('Are you sure you want to delete this match?')) return;
    
    try {
      await apiClient.deleteMatchCalendar(matchId);
      setMatches(matches.filter(match => match.id !== matchId));
      setSuccess('Match deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete match');
      setTimeout(() => setError(null), 5000);
    }
  };

  const openEditDialog = (match: MatchCalendar) => {
    setEditingMatch(match);
    setFormData({
      homeTeamId: match.homeTeamId.toString(),
      guestTeamId: match.guestTeamId.toString(),
      matchDateTime: match.matchDateTime,
      description: match.description,
    });
    setIsEditDialogOpen(true);
  };

  const getTeamName = (teamId: number) => {
    return teams.find(team => team.id === teamId)?.name || `Team ${teamId}`;
  };

  if (loading) {
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
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Match Calendar Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsCreateDialogOpen(true)}
        >
          Create Match
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <EventIcon color="primary" />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Matches
                  </Typography>
                  <Typography variant="h4">
                    {matches.length}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <CalendarIcon color="success" />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    This Month
                  </Typography>
                  <Typography variant="h4">
                    {matches.filter(match => {
                      const matchDate = new Date(match.matchDateTime);
                      const now = new Date();
                      return matchDate.getMonth() === now.getMonth() && 
                             matchDate.getFullYear() === now.getFullYear();
                    }).length}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Matches Table */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Scheduled Matches
        </Typography>
        
        {matches.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <EventIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No matches scheduled
            </Typography>
            <Typography color="text.secondary">
              Create your first match to get started
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Home Team</TableCell>
                  <TableCell>Guest Team</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {matches
                  .sort((a, b) => new Date(a.matchDateTime).getTime() - new Date(b.matchDateTime).getTime())
                  .map((match) => {
                    const matchDate = new Date(match.matchDateTime);
                    const now = new Date();
                    const isPast = matchDate < now;
                    
                    return (
                      <TableRow key={match.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {format(matchDate, 'PPP')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {format(matchDate, 'p')}
                          </Typography>
                        </TableCell>
                        <TableCell>{getTeamName(match.homeTeamId)}</TableCell>
                        <TableCell>{getTeamName(match.guestTeamId)}</TableCell>
                        <TableCell>{match.description}</TableCell>
                        <TableCell>
                          <Chip
                            label={isPast ? 'Completed' : 'Scheduled'}
                            color={isPast ? 'default' : 'primary'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            onClick={() => openEditDialog(match)}
                            size="small"
                            sx={{ mr: 1 }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDeleteMatch(match.id)}
                            size="small"
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Create Match Dialog */}
      <Dialog open={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Match</DialogTitle>
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
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateMatch} 
            variant="contained"
            disabled={!formData.homeTeamId || !formData.guestTeamId || !formData.matchDateTime}
          >
            Create Match
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Match Dialog */}
      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Match</DialogTitle>
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
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleEditMatch} 
            variant="contained"
            disabled={!formData.homeTeamId || !formData.guestTeamId || !formData.matchDateTime}
          >
            Update Match
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MatchCalendarManagement; 