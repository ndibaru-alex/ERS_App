import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Paper, TextField, Button, Typography } from '@mui/material';
import { toast } from 'react-toastify';
import { authService } from '../api/services/auth.service';

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if already authenticated
    const isAuthenticated = authService.isAuthenticated();
    const userRole = authService.getUserRole();
    
    if (isAuthenticated && userRole) {
      if (userRole === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/apply', { replace: true });
      }
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.login(formData.username, formData.password);
      
      // Wait for localStorage to be updated
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      toast.success('Login successful!');
      
      if (response.user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/apply', { replace: true });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(45deg, #1976d2 30%, #21CBF3 90%)'
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="h5" align="center" gutterBottom>
              Login to Employment Recruitment Service
            </Typography>
            
            <TextField
              fullWidth
              label="Username"
              margin="normal"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
            
            <TextField
              fullWidth
              type="password"
              label="Password"
              margin="normal"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}