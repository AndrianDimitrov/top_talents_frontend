import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Container,
  Box,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Button,
  Tabs,
  Tab,
  Avatar,
  Divider,
  LinearProgress,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  SportsSoccer as SoccerIcon,
  EmojiEvents as TrophyIcon,
  Timeline as TimelineIcon,
  CalendarToday as CalendarIcon,
  Star as StarIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { DateCalendar, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { apiClient } from '../../utils/apiClient';
import { RootState } from '../../store';
import { Talent, MatchHistory, MatchCalendar } from '../../types/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 4 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const TalentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [talent, setTalent] = useState<Talent | null>(null);
  const [matchHistory, setMatchHistory] = useState<MatchHistory[]>([]);
  const [matchCalendar, setMatchCalendar] = useState<MatchCalendar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);
  const theme = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError('Talent ID is required');
        return;
      }

      try {
        setIsLoading(true);
        const [talentData, historyData, calendarData] = await Promise.all([
          apiClient.getTalentById(parseInt(id)),
          apiClient.getMatchHistoryByTalent(parseInt(id)),
          apiClient.getAllMatchCalendar(),
        ]);
        setTalent(talentData);
        setMatchHistory(historyData);
        setMatchCalendar(calendarData);

        
        if (user?.id && user?.userType === 'SCOUT') {
          try {
            const scout = await apiClient.getScoutByUserId(user.id);
            setIsFollowing(scout.followedTalentIds.includes(parseInt(id)));
          } catch (error) {
            console.warn('Could not fetch scout data for follow status');
          }
        }
      } catch (err: any) {
        console.error('Error fetching talent data:', err);
        if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else if (err.message) {
          setError(err.message);
        } else {
          setError('Failed to load talent data');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, user?.id]);

  const handleFollowToggle = async () => {
    if (!user?.id || !id || user?.userType !== 'SCOUT') return;

    try {
      const scout = await apiClient.getScoutByUserId(user.id);
      const talentId = parseInt(id);

      let updatedScout: any;
      if (isFollowing) {
        updatedScout = await apiClient.unfollowTalent(scout.id, talentId);
      } else {
        updatedScout = await apiClient.followTalent(scout.id, talentId);
      }
      
      
      setIsFollowing(updatedScout.followedTalentIds.includes(talentId));
    } catch (err: any) {
      console.error('Error toggling follow status:', err);
      setError('Failed to update follow status');
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const calculateAverageRating = () => {
    if (matchHistory.length === 0) return 0;
    const sum = matchHistory.reduce((acc, match) => acc + match.rating, 0);
    return sum / matchHistory.length;
  };

  const calculateGoalsPerMatch = () => {
    if (!talent?.matchesPlayed || talent.matchesPlayed === 0) return 0;
    return talent.goals / talent.matchesPlayed;
  };

  const calculateAssistsPerMatch = () => {
    if (!talent?.matchesPlayed || talent.matchesPlayed === 0) return 0;
    return talent.assists / talent.matchesPlayed;
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Box textAlign="center">
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
            Loading talent profile...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!talent) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4, borderRadius: 2 }}>
          Talent not found
        </Alert>
      </Container>
    );
  }

  const averageRating = calculateAverageRating();

  return (
    <Box
      sx={{
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
        minHeight: '100vh',
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 4, 
              borderRadius: 2, 
              boxShadow: theme.shadows[4] 
            }}
          >
            {error}
          </Alert>
        )}

        {/* Hero Section */}
        <Card
          sx={{
            mb: 4,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: theme.shadows[10],
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar
                    src={talent.photoPath ? `http://localhost:8080/uploads/${talent.photoPath}` : '/default-profile.jpg'}
                    sx={{
                      width: 180,
                      height: 180,
                      mx: 'auto',
                      mb: 2,
                      border: `4px solid ${alpha('#fff', 0.3)}`,
                      boxShadow: theme.shadows[8],
                    }}
                  />
                  {user?.userType === 'SCOUT' && (
                    <Button
                      variant="contained"
                      startIcon={isFollowing ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                      onClick={handleFollowToggle}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.3)',
                        },
                        borderRadius: 2,
                        px: 3,
                      }}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </Button>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h2" fontWeight="bold" gutterBottom>
                  {talent.firstName} {talent.lastName}
                </Typography>
                <Typography variant="h5" sx={{ opacity: 0.9, mb: 3 }}>
                  {talent.position}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Chip
                    icon={<PersonIcon />}
                    label={`Age: ${talent.age}`}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontSize: '1rem',
                      px: 1,
                    }}
                  />
                  <Chip
                    icon={<StarIcon />}
                    label={`Rating: ${averageRating.toFixed(1)}`}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontSize: '1rem',
                      px: 1,
                    }}
                  />
                  <Chip
                    icon={<SoccerIcon />}
                    label={talent.teamName || 'Free Agent'}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontSize: '1rem',
                      px: 1,
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" fontWeight="bold">
                    {talent.matchesPlayed}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.8 }}>
                    Matches Played
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Stats Overview Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                color: 'white',
                height: '100%',
                boxShadow: theme.shadows[6],
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <SoccerIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h3" fontWeight="bold">
                  {talent.goals}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Goals
                </Typography>
                                 <Typography variant="caption" sx={{ opacity: 0.8 }}>
                   {calculateGoalsPerMatch().toFixed(2)} per match
                 </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`,
                color: 'white',
                height: '100%',
                boxShadow: theme.shadows[6],
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <TimelineIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h3" fontWeight="bold">
                  {talent.assists}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Assists
                </Typography>
                                 <Typography variant="caption" sx={{ opacity: 0.8 }}>
                   {calculateAssistsPerMatch().toFixed(2)} per match
                 </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
                color: 'white',
                height: '100%',
                boxShadow: theme.shadows[6],
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <TrophyIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h3" fontWeight="bold">
                  {talent.cleanSheets}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Clean Sheets
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Defensive record
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
                color: 'white',
                height: '100%',
                boxShadow: theme.shadows[6],
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <StarIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h3" fontWeight="bold">
                  {averageRating.toFixed(1)}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Avg Rating
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={(averageRating / 10) * 100}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: 'rgba(255,255,255,0.3)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: 'rgba(255,255,255,0.8)',
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Detailed Information Tabs */}
        <Card sx={{ boxShadow: theme.shadows[8], borderRadius: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="talent information tabs"
              sx={{
                '& .MuiTab-root': {
                  minHeight: 64,
                  fontSize: '1rem',
                  fontWeight: 600,
                },
              }}
            >
              <Tab
                icon={<TimelineIcon />}
                label="Performance Stats"
                iconPosition="start"
              />
              <Tab
                icon={<CalendarIcon />}
                label="Match Calendar"
                iconPosition="start"
              />
              <Tab
                icon={<TrophyIcon />}
                label="Match History"
                iconPosition="start"
              />
            </Tabs>
          </Box>

          {/* Performance Stats Tab */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Performance Metrics
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    Goals per Match
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                         <LinearProgress
                       variant="determinate"
                       value={Math.min((calculateGoalsPerMatch() / 2) * 100, 100)}
                       sx={{ flex: 1, mr: 2, height: 8, borderRadius: 4 }}
                     />
                     <Typography variant="h6" fontWeight="bold">
                       {calculateGoalsPerMatch().toFixed(2)}
                     </Typography>
                  </Box>
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    Assists per Match
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                         <LinearProgress
                       variant="determinate"
                       value={Math.min((calculateAssistsPerMatch() / 2) * 100, 100)}
                       sx={{ flex: 1, mr: 2, height: 8, borderRadius: 4 }}
                     />
                     <Typography variant="h6" fontWeight="bold">
                       {calculateAssistsPerMatch().toFixed(2)}
                     </Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    Average Rating
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LinearProgress
                      variant="determinate"
                      value={(averageRating / 10) * 100}
                      sx={{ flex: 1, mr: 2, height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="h6" fontWeight="bold">
                      {averageRating.toFixed(1)}/10
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Career Highlights
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Paper sx={{ p: 3, bgcolor: alpha(theme.palette.success.main, 0.1) }}>
                    <Typography variant="h4" color="success.main" fontWeight="bold">
                      {talent.goals + talent.assists}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Total Goal Contributions
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                    <Typography variant="h4" color="primary.main" fontWeight="bold">
                      {((talent.goals + talent.assists) / Math.max(talent.matchesPlayed, 1)).toFixed(2)}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Goal Contributions per Match
                    </Typography>
                  </Paper>
                </Box>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Calendar Tab */}
          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <DateCalendar sx={{ 
                      '& .MuiPickersDay-root': {
                        fontSize: '1rem',
                      },
                    }} />
                  </Box>
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Upcoming Matches
                </Typography>
                {matchCalendar.length === 0 ? (
                  <Paper sx={{ p: 4, textAlign: 'center', bgcolor: alpha(theme.palette.grey[500], 0.1) }}>
                    <CalendarIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No upcoming matches scheduled
                    </Typography>
                  </Paper>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {matchCalendar.slice(0, 5).map((match) => (
                      <Card key={match.id} sx={{ p: 2, boxShadow: theme.shadows[2] }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="h6" fontWeight="bold">
                              {format(new Date(match.matchDateTime), 'PPP')}
                            </Typography>
                            <Typography color="text.secondary">
                              {match.description}
                            </Typography>
                          </Box>
                          <Chip
                            label={format(new Date(match.matchDateTime), 'HH:mm')}
                            color="primary"
                            size="small"
                          />
                        </Box>
                      </Card>
                    ))}
                  </Box>
                )}
              </Grid>
            </Grid>
          </TabPanel>

          {/* Match History Tab */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Recent Match Performance
            </Typography>
            {matchHistory.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center', bgcolor: alpha(theme.palette.grey[500], 0.1) }}>
                <TrophyIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No match history available
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {matchHistory.map((match) => (
                  <Grid item xs={12} md={6} lg={4} key={match.id}>
                    <Card sx={{ 
                      height: '100%', 
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[8],
                      },
                    }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Box>
                            <Typography variant="h6" fontWeight="bold">
                              vs {match.opponentTeam}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {format(new Date(match.matchDate), 'MMM dd, yyyy')}
                            </Typography>
                          </Box>
                          <Chip
                            label={`${match.rating.toFixed(1)}`}
                            color={match.rating >= 7 ? 'success' : match.rating >= 6 ? 'warning' : 'error'}
                            sx={{ fontWeight: 'bold' }}
                          />
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h4" color="success.main" fontWeight="bold">
                                {match.goals}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Goals
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h4" color="info.main" fontWeight="bold">
                                {match.assists}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Assists
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                          <Chip
                            label={match.starter ? 'Starter' : 'Substitute'}
                            size="small"
                            color={match.starter ? 'primary' : 'default'}
                          />
                          {match.cleanSheet && (
                            <Chip
                              label="Clean Sheet"
                              size="small"
                              color="success"
                            />
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </TabPanel>
        </Card>
      </Container>
    </Box>
  );
};

export default TalentDetailPage; 