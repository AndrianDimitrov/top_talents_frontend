import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Chip,
  Paper,
  Avatar,
  Stack,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import {
  People as PeopleIcon,
  Groups as GroupsIcon,
  Search as SearchIcon,
  SportsFootball as SportsIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
  ManageAccounts as ManageAccountsIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../utils/apiClient';

interface SystemStats {
  userCount: number;
  talentCount: number;
  scoutCount: number;
  teamCount: number;
  scheduledMatchCount: number;
  matchHistoryCount: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
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

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    gradient,
    onClick 
  }: { 
    title: string; 
    value: number; 
    icon: React.ReactNode; 
    gradient: string;
    onClick?: () => void;
  }) => (
    <Card 
      sx={{ 
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        background: gradient,
        color: 'white',
        overflow: 'hidden',
        '&:hover': onClick ? { 
          transform: 'translateY(-4px)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        } : {},
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: 100,
          height: 100,
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          transform: 'translate(30px, -30px)',
        }
      }}
      onClick={onClick}
    >
      <CardContent sx={{ position: 'relative', zIndex: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Avatar sx={{ 
            bgcolor: 'rgba(255, 255, 255, 0.2)', 
            width: 56, 
            height: 56,
            backdropFilter: 'blur(10px)'
          }}>
            {icon}
          </Avatar>
          <TrendingUpIcon sx={{ opacity: 0.7 }} />
        </Stack>
        <Typography variant="h3" component="div" sx={{ fontWeight: 700, mb: 1 }}>
          {value.toLocaleString()}
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
          {title}
        </Typography>
      </CardContent>
    </Card>
  );

  const QuickActionCard = ({ 
    title, 
    description, 
    icon, 
    onClick,
    color = 'primary'
  }: {
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
    color?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error';
  }) => (
    <Card 
      sx={{ 
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': { 
          transform: 'translateY(-2px)',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }
      }} 
      onClick={onClick}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
          <Avatar sx={{ 
            bgcolor: alpha(theme.palette[color].main, 0.1),
            color: theme.palette[color].main,
            width: 48,
            height: 48
          }}>
            {icon}
          </Avatar>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
          {description}
        </Typography>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
          Loading dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            borderRadius: 2,
            '& .MuiAlert-icon': {
              fontSize: 24
            }
          }}
        >
          {error}
        </Alert>
      )}

      {/* Header Section */}
      <Paper 
        sx={{ 
          p: 4, 
          mb: 4, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 3
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
              Admin Dashboard
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Manage your TopTalents platform
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Chip 
              label="System Online" 
              sx={{
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                color: '#4caf50',
                fontWeight: 600,
                border: '2px solid rgba(76, 175, 80, 0.3)'
              }}
            />
            <Chip 
              label="Administrator" 
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontWeight: 600,
                border: '2px solid rgba(255, 255, 255, 0.3)'
              }}
            />
          </Stack>
        </Stack>
      </Paper>

      {/* System Statistics */}
      <Typography variant="h4" component="h2" sx={{ fontWeight: 700, mb: 3 }}>
        System Overview
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Total Users"
            value={stats?.userCount || 0}
            icon={<PeopleIcon fontSize="large" />}
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            onClick={() => navigate('/admin/users')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Talents"
            value={stats?.talentCount || 0}
            icon={<SportsIcon fontSize="large" />}
            gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Scouts"
            value={stats?.scoutCount || 0}
            icon={<SearchIcon fontSize="large" />}
            gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Teams"
            value={stats?.teamCount || 0}
            icon={<GroupsIcon fontSize="large" />}
            gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
            onClick={() => navigate('/admin/teams')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Scheduled"
            value={stats?.scheduledMatchCount || 0}
            icon={<TimelineIcon fontSize="large" />}
            gradient="linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Match History"
            value={stats?.matchHistoryCount || 0}
            icon={<AssessmentIcon fontSize="large" />}
            gradient="linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)"
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* Quick Actions */}
      <Typography variant="h4" component="h2" sx={{ fontWeight: 700, mb: 3 }}>
        Quick Actions
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <QuickActionCard
            title="User Management"
            description="View, edit, and manage all users in the system including talents and scouts"
            icon={<ManageAccountsIcon />}
            onClick={() => navigate('/admin/users')}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <QuickActionCard
            title="Team Management"
            description="Create, edit, and organize teams with full administrative control"
            icon={<GroupsIcon />}
            onClick={() => navigate('/admin/teams')}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <QuickActionCard
            title="Match Calendar"
            description="Manage and schedule match calendar events for all teams"
            icon={<TimelineIcon />}
            onClick={() => navigate('/admin/matches')}
            color="success"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <QuickActionCard
            title="System Analytics"
            description="View detailed system statistics and performance metrics"
            icon={<AssessmentIcon />}
            onClick={() => navigate('/admin/data')}
            color="info"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard; 