import { Box, useMediaQuery, useTheme } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Header from './layout/Header';
import Footer from './layout/Footer';
import Navigation from './layout/Navigation';
import { DRAWER_WIDTH, HEADER_HEIGHT, FOOTER_HEIGHT, CONTENT_PADDING } from '../constants/layout';

export default function Layout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      width: '100vw',
      overflowX: 'hidden'
    }}>
      <Header />
      
      <Box sx={{ 
        display: 'flex', 
        flex: 1,
        width: '100%',
        mt: { xs: `${HEADER_HEIGHT}px`, sm: 0 },
        flexDirection: { xs: 'column', sm: 'row' }
      }}>
        {!isMobile && <Navigation />}
        
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: CONTENT_PADDING / 8,
            width: { 
              xs: '100%', 
              sm: `calc(100% - ${DRAWER_WIDTH}px)` 
            },
            ml: { 
              xs: 0, 
              sm: `${DRAWER_WIDTH}px` 
            },
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? theme.palette.grey[50]
                : theme.palette.grey[900],
            borderRadius: { xs: 0, sm: 2 },
            overflow: 'auto',
            minHeight: `calc(100vh - ${HEADER_HEIGHT}px - ${FOOTER_HEIGHT}px)`,
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            '& > *': {
              maxWidth: '100%'
            }
          }}
        >
          <Outlet />
        </Box>
      </Box>
      
      <Footer />
    </Box>
  );
}