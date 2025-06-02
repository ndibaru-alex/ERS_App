import { Outlet } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography } from '@mui/material';
import Footer from './Footer';
import { HEADER_HEIGHT, FOOTER_HEIGHT } from '../../constants/layout';

export default function AuthLayout() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="fixed">
        <Toolbar>
          <Typography 
            variant="h6" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 'bold'
            }}
          >
            ERS - Employment Recruitment Service
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: `${HEADER_HEIGHT}px`,
          mb: `${FOOTER_HEIGHT}px`,
          backgroundColor: 'background.default',
        }}
      >
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
}