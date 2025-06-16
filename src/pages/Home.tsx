import { Box, Typography, Container, Button, Grid, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to TopTalents
        </Typography>
        <Typography variant="h5" component="h2" color="text.secondary" paragraph>
          Your platform for talent management and scouting
        </Typography>

        <Box sx={{ mt: 4, mb: 6 }}>
          <Button 
            variant="contained" 
            color="primary" 
            size="large" 
            onClick={() => navigate('/login')}
            sx={{ mr: 2 }}
          >
            Login
          </Button>
          <Button 
            variant="outlined" 
            color="primary" 
            size="large"
            onClick={() => navigate('/register')}
          >
            Register
          </Button>
        </Box>

        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Talent Management
              </Typography>
              <Typography color="text.secondary">
                Discover and manage top talents across various sports. Our platform helps you identify, track, and develop promising athletes.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Team Collaboration
              </Typography>
              <Typography color="text.secondary">
                Work seamlessly with your team. Share insights, coordinate scouting efforts, and make data-driven decisions together.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Advanced Analytics
              </Typography>
              <Typography color="text.secondary">
                Leverage powerful analytics tools to evaluate performance, track progress, and make informed decisions about talent development.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Home; 