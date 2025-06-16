import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import { apiClient } from '../../utils/apiClient';

interface SystemStats {
  userCount: number;
  talentCount: number;
  scoutCount: number;
  teamCount: number;
  scheduledMatchCount: number;
  matchHistoryCount: number;
}

const DataManagement = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getSystemStats();
      setStats(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load system stats');
    } finally {
      setLoading(false);
    }
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

      <Typography variant="h4" component="h1" gutterBottom>
        Data statistics
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Statistics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2">Total Users</Typography>
                <Typography variant="h4">{stats?.userCount || 0}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2">Total Talents</Typography>
                <Typography variant="h4">{stats?.talentCount || 0}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2">Total Scouts</Typography>
                <Typography variant="h4">{stats?.scoutCount || 0}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2">Total Teams</Typography>
                <Typography variant="h4">{stats?.teamCount || 0}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2">Scheduled Matches</Typography>
                <Typography variant="h4">{stats?.scheduledMatchCount || 0}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2">Match History</Typography>
                <Typography variant="h4">{stats?.matchHistoryCount || 0}</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DataManagement; 