import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Visibility as VisibilityIcon } from '@mui/icons-material';
import { apiClient } from '../../utils/apiClient';
import { Talent } from '../../types/api';

const ScoutTalentList = () => {
  const [error, setError] = useState<string | null>(null);
  const [talents, setTalents] = useState<Talent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTalents = async () => {
      try {
        setIsLoading(true);
        const searchParams = new URLSearchParams(location.search);
        const filters = {
          ageGroup: searchParams.get('ageGroup') || undefined,
          position: searchParams.get('position') || undefined,
          team: searchParams.get('team') || undefined,
        };
        const talentsData = await apiClient.searchTalents(filters);
        setTalents(talentsData);
      } catch (err: any) {
        console.error('Error fetching talents:', err);
        if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else if (err.message) {
          setError(err.message);
        } else {
          setError('Failed to load talents');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTalents();
  }, [location.search]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  
  const calculateRating = (talent: Talent): number => {
    if (talent.matchesPlayed === 0) return 5.0;
    const goalsPerMatch = talent.goals / talent.matchesPlayed;
    const assistsPerMatch = talent.assists / talent.matchesPlayed;
    const rating = Math.min(10, Math.max(1, 5 + (goalsPerMatch * 2) + (assistsPerMatch * 1.5)));
    return Math.round(rating * 10) / 10;
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'success';
    if (rating >= 6) return 'primary';
    if (rating >= 4) return 'warning';
    return 'error';
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
          Search Results ({talents.length} talents found)
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Position</TableCell>
                <TableCell>Age</TableCell>
                <TableCell>Team</TableCell>
                <TableCell>Matches</TableCell>
                <TableCell>Goals</TableCell>
                <TableCell>Assists</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {talents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography color="textSecondary">No talents found matching your criteria</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                talents
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((talent) => {
                    const rating = calculateRating(talent);
                    return (
                      <TableRow key={talent.id}>
                        <TableCell>
                          {talent.firstName} {talent.lastName}
                        </TableCell>
                        <TableCell>{talent.position}</TableCell>
                        <TableCell>{talent.age}</TableCell>
                        <TableCell>{talent.teamName || 'No team'}</TableCell>
                        <TableCell>{talent.matchesPlayed}</TableCell>
                        <TableCell>{talent.goals}</TableCell>
                        <TableCell>{talent.assists}</TableCell>
                        <TableCell>
                          <Chip
                            label={rating.toFixed(1)}
                            color={getRatingColor(rating)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title="View Profile">
                            <IconButton
                              onClick={() => navigate(`/talent/${talent.id}`)}
                              size="small"
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={talents.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Container>
  );
};

export default ScoutTalentList; 