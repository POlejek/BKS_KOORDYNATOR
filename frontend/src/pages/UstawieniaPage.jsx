import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Grid,
  Tabs,
  Tab
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { ustawieniaService } from '../services';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function UstawieniaPage() {
  const [tabValue, setTabValue] = useState(0);
  const [ustawienia, setUstawienia] = useState(null);
  const [newItem, setNewItem] = useState('');
  const [zalozenia, setZalozenia] = useState({
    trening1: '',
    trening2: '',
    trening3: '',
    trening4: ''
  });

  useEffect(() => {
    loadUstawienia();
  }, []);

  const loadUstawienia = async () => {
    try {
      const response = await ustawieniaService.get();
      setUstawienia(response.data);
      setZalozenia(response.data.zalozeniaTreningow || {
        trening1: '',
        trening2: '',
        trening3: '',
        trening4: ''
      });
    } catch (error) {
      console.error('Błąd ładowania ustawień:', error);
    }
  };

  const handleAddItem = async (type) => {
    if (!newItem.trim()) return;

    try {
      const endpoint = {
        dnaTechniki: 'addDnaTechniki',
        celeMotoryczne: 'addCelMotoryczny',
        celeMentalne: 'addCelMentalny'
      }[type];

      await ustawieniaService[endpoint]({ nazwa: newItem, aktywne: true });
      setNewItem('');
      loadUstawienia();
    } catch (error) {
      console.error('Błąd dodawania elementu:', error);
    }
  };

  const handleSaveZalozenia = async () => {
    try {
      await ustawieniaService.update({
        ...ustawienia,
        zalozeniaTreningow: zalozenia
      });
      alert('Założenia zostały zapisane');
    } catch (error) {
      console.error('Błąd zapisywania założeń:', error);
    }
  };

  const renderListSection = (title, items, type) => (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          size="small"
          fullWidth
          placeholder={`Dodaj ${title.toLowerCase()}`}
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleAddItem(type);
            }
          }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleAddItem(type)}
        >
          Dodaj
        </Button>
      </Box>
      <List>
        {items?.map((item, index) => (
          <React.Fragment key={index}>
            <ListItem
              secondaryAction={
                <IconButton edge="end" color="error">
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText primary={item.nazwa} />
            </ListItem>
            {index < items.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Ustawienia Klubu
      </Typography>

      <Paper sx={{ mt: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="DNA Techniki" />
          <Tab label="Cele Motoryczne" />
          <Tab label="Cele Mentalne" />
          <Tab label="Założenia Treningów" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {ustawienia && renderListSection('DNA Techniki', ustawienia.dnaTechniki, 'dnaTechniki')}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {ustawienia && renderListSection('Cele Motoryczne', ustawienia.celeMotoryczne, 'celeMotoryczne')}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {ustawienia && renderListSection('Cele Mentalne', ustawienia.celeMentalne, 'celeMentalne')}
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Założenia Trening 1"
                multiline
                rows={4}
                fullWidth
                value={zalozenia.trening1}
                onChange={(e) => setZalozenia({ ...zalozenia, trening1: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Założenia Trening 2"
                multiline
                rows={4}
                fullWidth
                value={zalozenia.trening2}
                onChange={(e) => setZalozenia({ ...zalozenia, trening2: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Założenia Trening 3"
                multiline
                rows={4}
                fullWidth
                value={zalozenia.trening3}
                onChange={(e) => setZalozenia({ ...zalozenia, trening3: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Założenia Trening 4"
                multiline
                rows={4}
                fullWidth
                value={zalozenia.trening4}
                onChange={(e) => setZalozenia({ ...zalozenia, trening4: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" onClick={handleSaveZalozenia}>
                Zapisz założenia
              </Button>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
}

export default UstawieniaPage;
