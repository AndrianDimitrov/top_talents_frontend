import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import DataTable, { Column } from '../../components/DataTable';
import { apiClient } from '../../utils/apiClient';
import { Team as ApiTeam } from '../../types/api';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface Team extends ApiTeam {
  logo?: string;
}

const TeamList = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const userRole = useSelector((state: RootState) => state.auth.userRole);

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

  const columns: Column<Team>[] = [
    { 
      id: 'name' as keyof Team, 
      label: 'Team Name', 
      minWidth: 170,
      format: (_value, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {row.logo && (
            <Box
              component="img"
              src={row.logo}
              alt={row.name}
              sx={{ width: 30, height: 30 }}
            />
          )}
          {row.name}
        </Box>
      )
    },
    { id: 'city' as keyof Team, label: 'City', minWidth: 100 },
    { id: 'ageGroup' as keyof Team, label: 'Age Group', minWidth: 100 },
    {
      id: 'id' as keyof Team,
      label: 'Actions',
      minWidth: 120,
      align: 'right' as const,
      format: (value: any, row) => (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => navigate(`/teams/${row.id}`)}
          >
            View
          </Button>
          {userRole === 'ADMIN' && (
            <Button
              size="small"
              variant="outlined"
              onClick={() => navigate(`/teams/${row.id}/edit`)}
            >
              Edit
            </Button>
          )}
        </Box>
      ),
    },
  ];

  const filteredTeams = teams.filter(
    (team) =>
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Teams
        </Typography>
        {userRole === 'ADMIN' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/teams/new')}
          >
            Add Team
          </Button>
        )}
      </Box>

      <TextField
        fullWidth
        label="Search teams"
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
      />

      <DataTable
        columns={columns}
        data={filteredTeams}
        loading={loading}
        error={error}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={filteredTeams.length}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
      />
    </Container>
  );
};

export default TeamList; 