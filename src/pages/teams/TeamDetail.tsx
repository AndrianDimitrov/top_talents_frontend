import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  Avatar,
  Chip,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Edit as EditIcon,
  Group as GroupIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { apiClient } from '../../utils/apiClient';
import { Team as ApiTeam } from '../../types/api';
import { RootState } from '../../store';

interface Player {
  id: number;
  firstName: string;
  lastName: string;
  position: string;
  number?: number;
  age: number;
  nationality: string;
  photoUrl?: string;
}

interface Team extends Omit<ApiTeam, 'logoUrl'> {
  logo?: string;
  players: Player[];
  stats: {
    matchesPlayed: number;
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
    points: number;
  };
}

const TeamDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const userRole = useSelector((state: RootState) => state.auth.userRole);

  useEffect(() => {
    fetchTeamDetails();
  }, [id]);

  const fetchTeamDetails = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await apiClient.getTeamById(parseInt(id));
      
      let players: Player[] = [];
      if (response.playerIds && response.playerIds.length > 0) {
        players = await Promise.all(
          response.playerIds.map(async (pid) => {
            const talent = await apiClient.getTalentById(pid);
            return {
              ...talent,
              photoUrl: talent.photoPath || undefined,
              number: undefined,
              nationality: '',
            };
          })
        );
      }

      const transformedTeam = {
        ...response,
        players, 
        stats: {
          matchesPlayed: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          points: 0
        }
      };
      setTeam(transformedTeam);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load team details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !team) {
    return (
      <Typography color="error" sx={{ p: 3 }}>
        {error || 'Team not found'}
      </Typography>
    );
  }

  return (
    <Container>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {team.logo ? (
              <Box
                component="img"
                src={team.logo}
                alt={team.name}
                sx={{ width: 80, height: 80 }}
              />
            ) : (
              <GroupIcon sx={{ fontSize: 80 }} />
            )}
            <Box>
              <Typography variant="h4">{team.name}</Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {team.city} {team.ageGroup ? `• Age Group ${team.ageGroup}` : ''}
              </Typography>
            </Box>
          </Box>
          {userRole === 'ADMIN' && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/teams/${id}/edit`)}
            >
              Edit Team
            </Button>
          )}
        </Box>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <LocationIcon />
              <Typography>
                {team.city}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
          <Tab label="Players" />
        </Tabs>

        {activeTab === 0 && (
          <List>
            {team.players.map((player) => (
              <ListItem
                key={player.id}
                sx={{ cursor: 'pointer' }}
                onClick={() => navigate(`/talents/${player.id}`)}
              >
                <ListItemAvatar>
                  <Avatar src={player.photoUrl}>
                    {player.number}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`${player.firstName} ${player.lastName}`}
                  secondary={[
                    player.position,
                    player.number !== undefined ? `#${player.number}` : null,
                    player.age !== undefined ? `${player.age} years` : null,
                    player.nationality
                  ].filter(Boolean).join(' • ')}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
};

export default TeamDetail; 