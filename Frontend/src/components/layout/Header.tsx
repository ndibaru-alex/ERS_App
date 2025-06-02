import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../../api/services/auth.service';

const navItems = [
  { label: 'Home',        to: '/',          roles: ['public', 'user', 'admin'] },
  { label: 'About',       to: '/about',     roles: ['public', 'user', 'admin'] },
  { label: 'Contact',     to: '/contact',   roles: ['public', 'user', 'admin'] },
  { label: 'Apply Now',   to: '/apply',     roles: ['public'] },
  { label: 'Dashboard',   to: '/dashboard', roles: ['user'] },
  { label: 'Admin Panel', to: '/admin',     roles: ['admin'] },
];

export default function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isPublicPage = ['/', '/apply'].includes(pathname);
  const isAdminPage = pathname.startsWith('/admin');
  const isLoggedIn = authService.isAuthenticated(); // your auth check
  const role = authService.getUserRole(); // e.g. 'public' | 'user' | 'admin'

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  // Filter nav items based on role
  const filteredNavs = navItems.filter(item => item.roles.includes(role));

  const title = isAdminPage
    ? 'ERS - Admin'
    : 'ERS - Employment Recruitment Service';

  return (
    <AppBar position="fixed" sx={{ width: '100%' }}>
      <Toolbar>
        {/* Mobile menu button */}
        {isMobile && (
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Logo / Title */}
        <Typography
          variant="h6"
          component={RouterLink}
          to={isAdminPage ? '/admin' : '/'}
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 'bold',
          }}
        >
          {title}
        </Typography>

        {/* Desktop nav buttons */}
        {!isMobile && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {filteredNavs.map(({ label, to }) => (
              <Button
                key={to}
                component={RouterLink}
                to={to}
                color="inherit"
                sx={{
                  fontWeight: 'bold',
                  ...(label === 'Apply Now'
                    ? {
                        bgcolor: 'primary.dark',
                        '&:hover': { bgcolor: 'primary.main' },
                      }
                    : {}),
                }}
              >
                {label}
              </Button>
            ))}

            {isLoggedIn && role !== 'public' && (
              <Button
                color="inherit"
                onClick={handleLogout}
                sx={{ fontWeight: 'bold' }}
              >
                Logout
              </Button>
            )}
          </Box>
        )}
      </Toolbar>

      {/* Mobile drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        ModalProps={{ keepMounted: true }}
      >
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={() => setDrawerOpen(false)}
          onKeyDown={() => setDrawerOpen(false)}
        >
          <List>
            {filteredNavs.map(({ label, to }) => (
              <ListItem key={to} disablePadding>
                <ListItemButton component={RouterLink} to={to}>
                  {label}
                </ListItemButton>
              </ListItem>
            ))}

            {isLoggedIn && role !== 'public' && (
              <ListItem disablePadding>
                <ListItemButton onClick={handleLogout}>
                  Logout
                </ListItemButton>
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}
