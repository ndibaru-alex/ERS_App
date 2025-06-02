import { Box, Typography, Container } from '@mui/material';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 2,
        mt: 'auto',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '50px',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[100]
            : theme.palette.grey[900],
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        zIndex: (theme) => theme.zIndex.drawer + 1
      }}
    >
      <Container maxWidth={false}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {'Copyright © '}
            ERS System {new Date().getFullYear()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Version 1.0.0
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}