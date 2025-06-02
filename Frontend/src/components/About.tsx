import { Box, Container, Typography, Paper } from '@mui/material';

export default function About() {
  return (
    <Box sx={{ py: 8 }}>
      <Container maxWidth="md">
        <Paper elevation={2} sx={{ p: 4, bgcolor: 'rgba(255,255,255,0.95)' }}>
          <Typography variant="h4" color="primary" gutterBottom>About Us</Typography>
          <Typography color="text.secondary" sx={{ fontSize: '1.15rem' }}>
            ERS (Employment Recruitment Service) is dedicated to connecting job seekers with the right opportunities and helping employers find the best talent. Our mission is to streamline the recruitment process, making it accessible, transparent, and efficient for everyone. Whether you are looking for your next career move or searching for qualified candidates, ERS is here to support you every step of the way.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
