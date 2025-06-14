import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { UserRole } from '../../store/slices/authSlice';
import { useState, useEffect } from 'react';
import { apiClient } from '../../utils/apiClient';
import { Container, Typography, Alert, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { setCredentials } from '../../store/slices/authSlice';
import TalentOnboardingPage from "../../pages/talent/TalentOnboardingPage";
import ScoutOnboardingPage from "../../pages/scout/ScoutOnboardingPage";
import { CircularProgress, Box } from '@mui/material';
import { Avatar } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

interface TalentOnboardingPageProps {
  onSuccess?: () => void;
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, userRole, token, user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [redirecting, setRedirecting] = useState(false);
  const [talent, setTalent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teamName, setTeamName] = useState<string | null>(null);
  const [profileChecked, setProfileChecked] = useState(false);
  const [formData, setFormData] = useState({
    homeTeamId: '',
    guestTeamId: '',
    matchDateTime: '',
    description: '',
  });

  console.log('DEBUG: ProtectedRoute', { isAuthenticated, userRole, token, user, allowedRoles, pathname: location.pathname });

  let redirectElement: React.ReactNode = null;

  const storedToken = localStorage.getItem('token');
  if (!storedToken || !token) {
    console.log('Redirect: No token');
    redirectElement = <Navigate to="/login" state={{ from: location }} replace />;
  } else {
    const tokenParts = storedToken.split('.');
    if (tokenParts.length !== 3) {
      console.log('Redirect: Invalid token');
      localStorage.removeItem('token');
      redirectElement = <Navigate to="/login" state={{ from: location }} replace />;
    } else if (!isAuthenticated) {
      console.log('Redirect: Not authenticated');
      redirectElement = <Navigate to="/login" state={{ from: location }} replace />;
    } else if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
      console.log('Redirect: Role not allowed');
      redirectElement = <Navigate to="/" replace />;
    }
  }

  if (
    !redirectElement &&
    !loading &&
    userRole === 'TALENT' &&
    location.pathname !== '/talent/create' &&
    location.pathname !== '/talent/profile/edit'
  ) {
    const storedUser = localStorage.getItem('user');
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    if (!parsedUser?.talentId) {
      console.log('Redirect: No talentId in user');
      redirectElement = <Navigate to="/talent/create" replace />;
    }
  }

  useEffect(() => {
    const checkExistingProfile = async () => {
      console.log('ProtectedRoute: checkExistingProfile called', { 
        userId: user?.id, 
        userRole, 
        pathname: location.pathname, 
        profileChecked,
        talentId: user?.talentId,
        scoutId: user?.scoutId
      });

      if (!user?.id || profileChecked) {
        console.log('ProtectedRoute: Skipping profile check - no user ID or already checked');
        setLoading(false);
        return;
      }

      if (
        (userRole === 'TALENT' && location.pathname === '/talent/create') ||
        (userRole === 'SCOUT' && location.pathname === '/scout/create')
      ) {
        console.log('ProtectedRoute: On onboarding page, skipping profile check');
        setLoading(false);
        return;
      }

      if (userRole === 'TALENT' && user.talentId) {
        console.log('ProtectedRoute: User already has talentId:', user.talentId);
        setProfileChecked(true);
        setLoading(false);
        return;
      }
      
      if (userRole === 'SCOUT' && user.scoutId) {
        console.log('ProtectedRoute: User already has scoutId:', user.scoutId);
        setProfileChecked(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        let existingProfile = null;

        console.log('ProtectedRoute: Checking for existing profile via API');

        if (userRole === 'TALENT') {
          console.log('ProtectedRoute: Calling getTalentByUserId');
          existingProfile = await apiClient.getTalentByUserId(user.id);
        } else if (userRole === 'SCOUT') {
          console.log('ProtectedRoute: Calling getScoutByUserId');
          existingProfile = await apiClient.getScoutByUserId(user.id);
        }

        if (existingProfile && existingProfile.id) {
          console.log('Found existing profile:', existingProfile);
          const updatedUser = {
            ...user,
            ...(userRole === 'TALENT' ? { talentId: existingProfile.id } : { scoutId: existingProfile.id })
          };

          localStorage.setItem('user', JSON.stringify(updatedUser));

          dispatch(setCredentials({
            token: token || '',
            userRole: userRole || 'TALENT',
            user: updatedUser
          }));

          setTalent(existingProfile);
          setProfileChecked(true);
          setNeedsOnboarding(false);
        } else {
          console.log('ProtectedRoute: No existing profile found, needs onboarding');
          setNeedsOnboarding(true);
        }
      } catch (error: any) {
        console.log('Profile check error:', error.response?.status, error.message);
        if (error.response?.status === 404) {
          console.log('ProtectedRoute: 404 error, needs onboarding');
          setNeedsOnboarding(true);
        } else {
          console.error('Profile check failed:', error);
          setError('Failed to load profile');
        }
      } finally {
        setLoading(false);
      }
    };

    checkExistingProfile();
  }, [user?.id, userRole, location.pathname, token, dispatch, profileChecked]);

  useEffect(() => {
    const fetchTeam = async () => {
      if (talent?.teamId) {
        try {
          const team = await apiClient.getTeamById(talent.teamId);
          setTeamName(team.name);
          console.log('teamsData:', team);
        } catch (error) {
          setTeamName(null);
        }
      } else {
        setTeamName(null);
      }
    };
    fetchTeam();
  }, [talent?.teamId]);

  const handlePhotoUpload = async (file: File) => {
    await apiClient.uploadTalentPhoto(talent.id, file);
    const updatedTalent = await apiClient.getTalentByUserId(talent.userId);
    setTalent(updatedTalent);
  };

  if (redirecting) {
    return null;
  }

  if (redirectElement) {
    return <>{redirectElement}</>;
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (needsOnboarding) {
    if (userRole === 'TALENT') {
      return <TalentOnboardingPage />;
    } else if (userRole === 'SCOUT') {
      return <ScoutOnboardingPage />;
    }
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  console.log('DEBUG: ProtectedRoute - Rendering children');
  console.log('Updated user in localStorage:', localStorage.getItem('user'));

  const defaultAvatar = '/default-avatar.png';
  const photoUrl = talent?.photoPath
    ? `http://localhost:8080/uploads/${talent.photoPath}`
    : defaultAvatar;

  console.log('Talent object in ProfileCard:', talent);

  return (
    <>
      {children}
    </>
  );
};

export default ProtectedRoute; 