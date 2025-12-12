import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
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
  ListItemButton
} from '@mui/material';
import {
  People as PeopleIcon,
  CalendarMonth as CalendarIcon,
  School as SchoolIcon,
  Settings as SettingsIcon,
  Groups as GroupsIcon,
  SportsScore as SportsScoreIcon
} from '@mui/icons-material';

// Import stron
import ObecnosciPage from './pages/ObecnosciPage';
import ZawodnicyPage from './pages/ZawodnicyPage';
import PlanSzkoleniowy from './pages/PlanSzkoleniowy';
import UstawieniaPage from './pages/UstawieniaPage';
import DruzynyPage from './pages/DruzynyPage';
import KontrolaMeczowaPage from './pages/KontrolaMeczowaPage';

function App() {
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const menuItems = [
    { text: 'Drużyny', icon: <GroupsIcon />, path: '/druzyny' },
    { text: 'Zawodnicy', icon: <PeopleIcon />, path: '/zawodnicy' },
    { text: 'Obecności', icon: <CalendarIcon />, path: '/obecnosci' },
    { text: 'Plan Szkoleniowy', icon: <SchoolIcon />, path: '/plan-szkoleniowy' },
    { text: 'Kontrola Meczowa', icon: <SportsScoreIcon />, path: '/kontrola-meczowa' },
    { text: 'Ustawienia', icon: <SettingsIcon />, path: '/ustawienia' },
  ];

  return (
    <Router>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              BKS Koordynator
            </Typography>
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
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1 }}>
          <Routes>
            <Route path="/" element={<DruzynyPage />} />
            <Route path="/druzyny" element={<DruzynyPage />} />
            <Route path="/zawodnicy" element={<ZawodnicyPage />} />
            <Route path="/obecnosci" element={<ObecnosciPage />} />
            <Route path="/plan-szkoleniowy" element={<PlanSzkoleniowy />} />
            <Route path="/kontrola-meczowa" element={<KontrolaMeczowaPage />} />
            <Route path="/ustawienia" element={<UstawieniaPage />} />
          </Routes>
        </Container>

        <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: '#f5f5f5' }}>
          <Container maxWidth="xl">
            <Typography variant="body2" color="text.secondary" align="center">
              © 2024 BKS Koordynator - System Zarządzania Klubem Sportowym
            </Typography>
          </Container>
        </Box>
      </Box>
    </Router>
  );
}

export default App;
