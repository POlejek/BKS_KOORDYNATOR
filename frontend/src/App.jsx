import React from 'react';
import {
  HashRouter as Router,
  Routes,
  Route,
  Link,
  Outlet,
  useNavigate,
} from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import {
  People as PeopleIcon,
  CalendarMonth as CalendarIcon,
  School as SchoolIcon,
  Settings as SettingsIcon,
  Groups as GroupsIcon,
  SportsScore as SportsScoreIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';

import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';

// Import stron
import LoginPage from './pages/LoginPage';
import ObecnosciPage from './pages/ObecnosciPage';
import ZawodnicyPage from './pages/ZawodnicyPage';
import PlanSzkoleniowy from './pages/PlanSzkoleniowy';
import UstawieniaPage from './pages/UstawieniaPage';
import DruzynyPage from './pages/DruzynyPage';
import KontrolaMeczowaPage from './pages/KontrolaMeczowaPage';
import DashboardPage from './pages/DashboardPage';
import PlayerPage from './pages/PlayerPage';

const allMenuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Drużyny', icon: <GroupsIcon />, path: '/druzyny' },
  { text: 'Zawodnicy', icon: <PeopleIcon />, path: '/zawodnicy' },
  { text: 'Obecności', icon: <CalendarIcon />, path: '/obecnosci' },
  { text: 'Plan Szkoleniowy', icon: <SchoolIcon />, path: '/plan-szkoleniowy' },
  { text: 'Kontrola Meczowa', icon: <SportsScoreIcon />, path: '/kontrola-meczowa' },
  { text: 'Ustawienia', icon: <SettingsIcon />, path: '/ustawienia', roles: ['admin', 'koordynator'] },
];

function Layout() {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const menuItems = allMenuItems.filter((item) => !item.roles || hasRole(...item.roles));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            BKS Koordynator
          </Typography>
          {isSmall ? (
            <IconButton color="inherit" edge="end" onClick={() => setDrawerOpen(true)} aria-label="menu">
              <MenuIcon />
            </IconButton>
          ) : (
            <>
              {menuItems.map((item) => (
                <Button
                  key={item.path}
                  color="inherit"
                  component={Link}
                  to={item.path}
                  startIcon={item.icon}
                >
                  {item.text}
                </Button>
              ))}
              <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}>
                {user?.imie || 'Wyloguj'}
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 250 }} role="presentation">
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton component={Link} to={item.path} onClick={() => setDrawerOpen(false)}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Wyloguj" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1 }}>
        <Outlet />
      </Container>

      <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: '#f5f5f5' }}>
        <Container maxWidth="xl">
          <Typography variant="body2" color="text.secondary" align="center">
            © 2024 BKS Koordynator - System Zarządzania Klubem Sportowym
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <ErrorBoundary>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                element={
                  <ProtectedRoute>
                    <AppProvider>
                      <Layout />
                    </AppProvider>
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<DashboardPage />} />
                <Route path="/druzyny" element={<DruzynyPage />} />
                <Route path="/zawodnicy" element={<ZawodnicyPage />} />
                <Route path="/zawodnicy/:id" element={<PlayerPage />} />
                <Route path="/obecnosci" element={<ObecnosciPage />} />
                <Route path="/plan-szkoleniowy" element={<PlanSzkoleniowy />} />
                <Route path="/kontrola-meczowa" element={<KontrolaMeczowaPage />} />
                <Route
                  path="/ustawienia"
                  element={
                    <ProtectedRoute role={['admin', 'koordynator']}>
                      <UstawieniaPage />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Routes>
          </ErrorBoundary>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
