import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Box,
} from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  const cards = [
    {
      title: 'Easy Registration',
      description: 'Simple and straightforward registration process for all applicants.',
      buttonText: 'Register Now',
      link: '/register',
    },
    {
      title: 'Track Applications',
      description: 'Monitor your application status and progress in real-time.',
      buttonText: 'Check Status',
      link: '/login',
    },
    {
      title: 'Secure Platform',
      description: 'Your data is protected with industry-standard security measures.',
      buttonText: 'Learn More',
      link: '/about',
    },
  ];

  return (
    <Container
      maxWidth={false}
      disableGutters
       sx={{
    width: '100vw',
    height: '100vh',
    background: 'linear-gradient(to right, #e3f2fd, #ede7f6)',
    overflow: 'auto',
    p: 4,
  }}
    >
      <Box textAlign="center" mb={6} component="main"
 >
        <Typography variant="h2" gutterBottom sx={{ color: '#1a237e' }}>
          Welcome to ERS
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Your gateway to employment registration and management
        </Typography>
        <Button
          variant="contained"
          size="large"
          component={RouterLink}
          to="MobileSearch"
          endIcon={<ArrowForward />}
          sx={{
            mt: 2,
            backgroundColor: '#5e35b1',
            '&:hover': { backgroundColor: '#4527a0' },
          }}
        >
          Get Started
        </Button>
      </Box>

      <Box textAlign="center" mb={6}>
        <Typography variant="h4" gutterBottom sx={{ color: '#0d47a1' }}>
          Welcome to the Employment Application System
        </Typography>
        <Typography variant="body1" gutterBottom>
          Please log in to access your account and manage your applications.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleLogin}
          sx={{ mt: 2 }}
        >
          Login
        </Button>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          },
          gap: 4,
        }}
      >
        {cards.map((card, index) => (
          <Card
            key={index}
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0px 4px 20px rgba(93, 64, 155, 0.2)',
              borderRadius: 3,
              backgroundColor: '#f3e5f5',
            }}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography gutterBottom variant="h5" component="h2" sx={{ color: '#311b92' }}>
                {card.title}
              </Typography>
              <Typography color="text.secondary">{card.description}</Typography>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                variant="outlined"
                sx={{
                  color: '#5e35b1',
                  borderColor: '#5e35b1',
                  '&:hover': {
                    backgroundColor: '#ede7f6',
                  },
                }}
                component={RouterLink}
                to={card.link}
              >
                {card.buttonText}
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>
    </Container>
  );
}
