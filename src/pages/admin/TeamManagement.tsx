import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../utils/apiClient';
import { Team, CreateTeamRequest, UpdateTeamRequest } from '../../types/api';

interface TeamFormData {
  name: string;
  city: string;
  ageGroup: string;
}

const TeamManagement = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState<TeamFormData>({
    name: '',
    city: '',
    ageGroup: '',
  });

  const ageGroups = [
    'U10', 'U12', 'U14', 'U16', 'U18', 'U20', 'U21', 'Senior'
  ];

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getAllTeams();
      setTeams(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (team?: Team) => {
    if (team) {
      setSelectedTeam(team);
      setFormData({
        name: team.name,
        city: team.city,
        ageGroup: team.ageGroup,
      });
    } else {
      setSelectedTeam(null);
      setFormData({
        name: '',
        city: '',
        ageGroup: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTeam(null);
    setError(null);
  };

  const handleSubmit = async () => {
    try {
      // Validate form data
      if (!formData.name.trim()) {
        setError('Team name is required');
        return;
      }
      if (!formData.city.trim()) {
        setError('City is required');
        return;
      }
      if (!formData.ageGroup) {
        setError('Age group is required');
        return;
      }

      if (selectedTeam) {
        // Update existing team
        const updateData: UpdateTeamRequest = {
          name: formData.name.trim(),
          city: formData.city.trim(),
          ageGroup: formData.ageGroup,
        };
        await apiClient.updateTeam(selectedTeam.id, updateData);
      } else {
        // Create new team
        const createData: CreateTeamRequest = {
          name: formData.name.trim(),
          city: formData.city.trim(),
          ageGroup: formData.ageGroup,
        };
        await apiClient.createTeam(createData);
      }
      
      fetchTeams();
      handleCloseDialog();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save team');
    }
  };

  const handleDelete = async (teamId: number, teamName: string) => {
    if (window.confirm(`Are you sure you want to delete "${teamName}"? This action cannot be undone.`)) {
      try {
        await apiClient.deleteTeam(teamId);
        fetchTeams();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete team');
      }
    }
  };

  const handleViewDetails = (teamId: number) => {
    navigate(`/teams/${teamId}`);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getAgeGroupColor = (ageGroup: string) => {
    const colors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
      'U10': 'info',
      'U12': 'info',
      'U14': 'primary',
      'U16': 'primary',
      'U18': 'warning',
      'U20': 'warning',
      'U21': 'secondary',
      'Senior': 'success',
    };
    return colors[ageGroup] || 'default';
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
      {error && !openDialog && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Team Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Team
        </Button>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Team Name</TableCell>
                <TableCell>City</TableCell>
                <TableCell>Age Group</TableCell>
                <TableCell>Players</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teams
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((team) => (
                  <TableRow key={team.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {team.name}
                      </Typography>
                    </TableCell>
                    <TableCell>{team.city}</TableCell>
                    <TableCell>
                      <Chip 
                        label={team.ageGroup} 
                        size="small" 
                        color={getAgeGroupColor(team.ageGroup)}
                      />
                    </TableCell>
                    <TableCell>
                      {team.playerIds?.length || 0} players
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(team.id)}
                        title="View Details"
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(team)}
                        title="Edit Team"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(team.id, team.name)}
                        title="Delete Team"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              {teams.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      No teams found. Click "Add Team" to create one.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={teams.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Create/Edit Team Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedTeam ? 'Edit Team' : 'Create New Team'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Team Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
              placeholder="e.g., Manchester United"
            />
            <TextField
              label="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              fullWidth
              required
              placeholder="e.g., Manchester"
            />
            <FormControl fullWidth required>
              <InputLabel>Age Group</InputLabel>
              <Select
                value={formData.ageGroup}
                label="Age Group"
                onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value })}
              >
                {ageGroups.map((group) => (
                  <MenuItem key={group} value={group}>
                    {group}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedTeam ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TeamManagement; 