import { Outlet } from 'react-router-dom';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  IconButton, 
  Menu as MuiMenu, 
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  ListItemButton,
  useMediaQuery,
  useTheme,
  Chip,
  Stack
} from '@mui/material';
import { 
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Groups as GroupsIcon,
  Assessment as AssessmentIcon,
  CalendarToday as CalendarIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  SportsSoccer as SoccerIcon,
  Close as CloseIcon,
  Settings as SettingsIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon
} from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { UserRole } from '../../store/slices/authSlice';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';

const drawerWidth = 280;

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const { mode, toggleMode } = useCustomTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { userRole, user } = useSelector((state: RootState) => state.auth);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getIconForPath = (path: string) => {
    if (path.includes('dashboard')) return <DashboardIcon />;
    if (path.includes('users') || path.includes('talents')) return <PeopleIcon />;
    if (path.includes('teams') || path.includes('team')) return <GroupsIcon />;
    if (path.includes('data') || path.includes('management')) return <AssessmentIcon />;
    if (path.includes('calendar')) return <CalendarIcon />;
    if (path.includes('history')) return <HistoryIcon />;
    return <DashboardIcon />;
  };

  const getRoleColor = (role: UserRole | null) => {
    switch (role) {
      case 'ADMIN': return 'error';
      case 'SCOUT': return 'warning';
      case 'TALENT': return 'success';
      default: return 'default';
    }
  };

  const getNavigationItems = (role: UserRole | null) => {
    const items = [];

    switch (role) {
      case 'ADMIN':
        items.push(
          { label: 'Dashboard', path: '/admin/dashboard' },
          { label: 'User Management', path: '/admin/users' },
          { label: 'Team Management', path: '/admin/teams' },
          { label: 'Match Calendar', path: '/admin/matches' },
          { label: 'Data statistics', path: '/admin/data' }
        );
        break;
      case 'TALENT':
        items.push(
          { label: 'Dashboard', path: '/talent/dashboard' },
          { label: 'Calendar', path: '/talent/calendar' },
          { label: 'History', path: '/talent/history' }
        );
        break;
      case 'SCOUT':
        items.push(
          { label: 'Dashboard', path: '/scout/dashboard' },
          { label: 'Talents', path: '/scout/talents' }
        );
        break;
    }

    // Add Teams link for non-admin users only
    if (role !== 'ADMIN') {
      items.push({ label: 'Teams', path: '/teams' });
    }
    
    return items;
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ 
        p: 3, 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar sx={{ 
            width: 48, 
            height: 48, 
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)'
          }}>
            <PersonIcon />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              {user?.email.split('@')[0]}
            </Typography>
            <Chip 
              label={userRole} 
              size="small" 
              sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontWeight: 500
              }} 
            />
          </Box>
        </Stack>
      </Box>
      
      <List sx={{ flex: 1, px: 2, py: 2 }}>
        {getNavigationItems(userRole).map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              }}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  background: 'linear-gradient(135deg, rgba(102, 102, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(102, 102, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
                  }
                }
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? theme.palette.primary.main : 'inherit' }}>
                {getIconForPath(item.path)}
              </ListItemIcon>
              <ListItemText 
                primary={item.label}
                primaryTypographyProps={{ 
                  fontWeight: location.pathname === item.path ? 600 : 400 
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />
      
      <Box sx={{ p: 2 }}>
        <ListItemButton
          onClick={() => {
            navigate('/account/settings');
            if (isMobile) setMobileOpen(false);
          }}
          sx={{ 
            borderRadius: 2,
            mb: 1,
            '&:hover': {
              backgroundColor: theme.palette.primary.main + '10'
            }
          }}
        >
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Account Settings" />
        </ListItemButton>
        
        <ListItemButton
          onClick={handleLogout}
          sx={{ 
            borderRadius: 2,
            color: theme.palette.error.main,
            '&:hover': {
              backgroundColor: theme.palette.error.main + '10'
            }
          }}
        >
          <ListItemIcon sx={{ color: theme.palette.error.main }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          background: mode === 'light' 
            ? 'rgba(255, 255, 255, 0.95)' 
            : 'rgba(30, 30, 30, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: mode === 'light' 
            ? '1px solid rgba(0, 0, 0, 0.08)' 
            : '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, color: theme.palette.text.primary }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <SoccerIcon sx={{ color: theme.palette.primary.main }} />
              TopTalents
            </Stack>
          </Typography>
          
          {/* Dark mode toggle */}
          <IconButton
            onClick={toggleMode}
            sx={{ mr: 1, color: theme.palette.text.primary }}
            title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
          >
            {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
          
          {isMobile && (
            <IconButton
              size="large"
              aria-label="account menu"
              onClick={handleMenu}
              sx={{ color: theme.palette.text.primary }}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>
                <PersonIcon sx={{ fontSize: 20 }} />
              </Avatar>
            </IconButton>
          )}
          <MuiMenu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            keepMounted
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            sx={{
              mt: 1,
              '& .MuiPaper-root': {
                borderRadius: 2,
                minWidth: 180,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              }
            }}
          >
            <MenuItem 
              onClick={() => {
                navigate('/account/settings');
                handleClose();
              }}
            >
              <SettingsIcon sx={{ mr: 2, fontSize: 20 }} />
              Account Settings
            </MenuItem>
            <MenuItem 
              onClick={() => {
                toggleMode();
                handleClose();
              }}
            >
              {mode === 'light' ? <DarkModeIcon sx={{ mr: 2, fontSize: 20 }} /> : <LightModeIcon sx={{ mr: 2, fontSize: 20 }} />}
              {mode === 'light' ? 'Dark Mode' : 'Light Mode'}
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: theme.palette.error.main }}>
              <LogoutIcon sx={{ mr: 2, fontSize: 20 }} />
              Logout
            </MenuItem>
          </MuiMenu>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              border: 'none',
              boxShadow: '4px 0 6px -1px rgba(0, 0, 0, 0.1)'
            },
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
            <IconButton onClick={handleDrawerToggle}>
              <CloseIcon />
            </IconButton>
          </Box>
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              border: 'none',
              boxShadow: '4px 0 6px -1px rgba(0, 0, 0, 0.1)'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: theme.palette.background.default,
          minHeight: '100vh'
        }}
      >
        <Toolbar />
        <Container 
          maxWidth="xl" 
          sx={{ 
            mt: 4, 
            mb: 4,
            px: { xs: 2, sm: 3, md: 4 }
          }}
        >
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default Layout; 