import { Button, Card, CardContent, Container, Box, Typography } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';

export default function Contact() {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h2" align="center" gutterBottom>
        Contact Us
      </Typography>
      <Typography variant="h5" align="center" color="text.secondary" paragraph>
        Get in touch with our team for any inquiries or support
      </Typography>

      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          md: 'repeat(2, 1fr)'
        },
        gap: 4,
        mt: 4
      }}>
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
            <LocationOnIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography gutterBottom variant="h5">
              Visit Us
            </Typography>
            <Typography variant="body1" color="text.secondary">
              123 Main Street<br />
              Addis Ababa, Ethiopia
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
            <EmailIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography gutterBottom variant="h5">
              Email Us
            </Typography>
            <Typography variant="body1" color="text.secondary">
              info@example.com<br />
              support@example.com
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Typography variant="h4" align="center" sx={{ mt: 8, mb: 4 }}>
        Ready to Get Started?
      </Typography>
      <Typography align="center">
        <Button variant="contained" size="large" href="/register">
          Apply Now
        </Button>
      </Typography>
    </Container>
  );
}
