import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Container,
  Box,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { format } from 'date-fns';
import { apiClient } from '../../utils/apiClient';
import { RootState } from '../../store';
import { MatchHistory } from '../../types/api';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';

const TalentHistoryPage = () => {
  const [error, setError] = useState<string | null>(null);
  const [matches, setMatches] = useState<MatchHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useSelector((state: RootState) => state.auth);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    id: undefined as number | undefined,
    matchDate: '',
    opponentTeam: '',
    goals: 0,
    assists: 0,
    starter: false,
    cleanSheet: false,
  });

  useEffect(() => {
    const fetchMatchHistory = async () => {
      const talentId = user?.talentId;
      if (!talentId) {
        setError('Authentication required');
        return;
      }

      try {
        setIsLoading(true);
        const matchesData = await apiClient.getMatchHistoryByTalent(talentId);
        setMatches(matchesData);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching match history:', err);
        if (err.response?.status === 404) {
         
          setMatches([]);
          setError(null);
        } else if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else if (err.message) {
          setError(err.message);
        } else {
          setError('Failed to load match history');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatchHistory();
  }, [user?.talentId]);

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'success';
    if (rating >= 6) return 'primary';
    if (rating >= 4) return 'warning';
    return 'error';
  };

  const openAddDialog = () => {
    setFormData({
      id: undefined,
      matchDate: '',
      opponentTeam: '',
      goals: 0,
      assists: 0,
      starter: false,
      cleanSheet: false,
    });
    setIsEditMode(false);
    setIsDialogOpen(true);
  };

  const openEditDialog = (match: MatchHistory) => {
    setFormData({
      id: match.id,
      matchDate: match.matchDate,
      opponentTeam: match.opponentTeam,
      goals: match.goals,
      assists: match.assists,
      starter: match.starter,
      cleanSheet: match.cleanSheet,
    });
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFormSubmit = async () => {
    const talentId = user?.talentId;
    if (!talentId) return;
    try {
      if (isEditMode && formData.id !== undefined) {
        // Update
        await apiClient.updateMatchHistory(formData.id, {
          talentId: talentId,
          matchDate: formData.matchDate,
          opponentTeam: formData.opponentTeam,
          goals: Number(formData.goals),
          assists: Number(formData.assists),
          starter: formData.starter,
          cleanSheet: formData.cleanSheet,
        });
      } else {
        // Add
        await apiClient.createMatchHistory({
          talentId: talentId,
          matchDate: formData.matchDate,
          opponentTeam: formData.opponentTeam,
          goals: Number(formData.goals),
          assists: Number(formData.assists),
          starter: formData.starter,
          cleanSheet: formData.cleanSheet,
        });
      }
      setIsDialogOpen(false);
      // Refresh
      const matchesData = await apiClient.getMatchHistoryByTalent(talentId);
      setMatches(matchesData);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save match');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this match history event?')) return;
    try {
      await apiClient.deleteMatchHistory(id);
      // Refresh
      const talentId = user?.talentId;
      if (talentId) {
        const matchesData = await apiClient.getMatchHistoryByTalent(talentId);
        setMatches(matchesData);
      }
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to delete match');
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
      <Button variant="contained" sx={{ mb: 2 }} onClick={openAddDialog}>
        Add Match
      </Button>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>
          Match History
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Opponent</TableCell>
                <TableCell>Goals</TableCell>
                <TableCell>Assists</TableCell>
                <TableCell>Started</TableCell>
                <TableCell>Clean Sheet</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {matches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="textSecondary">No match history available</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                matches.map((match) => (
                  <TableRow key={match.id}>
                    <TableCell>
                      {format(new Date(match.matchDate), 'PPP')}
                    </TableCell>
                    <TableCell>{match.opponentTeam}</TableCell>
                    <TableCell>{match.goals}</TableCell>
                    <TableCell>{match.assists}</TableCell>
                    <TableCell>
                      <Chip
                        label={match.starter ? 'Yes' : 'No'}
                        color={match.starter ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={match.cleanSheet ? 'Yes' : 'No'}
                        color={match.cleanSheet ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={match.rating.toFixed(1)}
                        color={getRatingColor(match.rating)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => openEditDialog(match)}>
                        Edit
                      </Button>
                      <IconButton size="small" color="error" onClick={() => handleDelete(match.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onClose={handleDialogClose}>
        <DialogTitle>{isEditMode ? 'Edit Match' : 'Add Match'}</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Match Date"
              value={formData.matchDate ? new Date(formData.matchDate) : null}
              onChange={(date) => handleFormChange('matchDate', date ? format(date, 'yyyy-MM-dd') : '')}
              slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
            />
          </LocalizationProvider>
          <TextField
            margin="normal"
            fullWidth
            label="Opponent Team"
            value={formData.opponentTeam}
            onChange={(e) => handleFormChange('opponentTeam', e.target.value)}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Goals"
            type="number"
            value={formData.goals}
            onChange={(e) => handleFormChange('goals', e.target.value)}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Assists"
            type="number"
            value={formData.assists}
            onChange={(e) => handleFormChange('assists', e.target.value)}
          />
          <Box display="flex" alignItems="center" mt={2}>
            <Typography>Started</Typography>
            <Button
              variant={formData.starter ? 'contained' : 'outlined'}
              color={formData.starter ? 'primary' : 'inherit'}
              onClick={() => handleFormChange('starter', !formData.starter)}
              sx={{ ml: 2 }}
            >
              {formData.starter ? 'Yes' : 'No'}
            </Button>
            <Typography sx={{ ml: 4 }}>Clean Sheet</Typography>
            <Button
              variant={formData.cleanSheet ? 'contained' : 'outlined'}
              color={formData.cleanSheet ? 'primary' : 'inherit'}
              onClick={() => handleFormChange('cleanSheet', !formData.cleanSheet)}
              sx={{ ml: 2 }}
            >
              {formData.cleanSheet ? 'Yes' : 'No'}
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleFormSubmit} variant="contained">
            {isEditMode ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TalentHistoryPage; 