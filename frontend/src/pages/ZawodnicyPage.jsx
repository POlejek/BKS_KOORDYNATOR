import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Chip
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, AttachFile } from '@mui/icons-material';
import { zawodnicyService, druzynyService } from '../services';
import { format } from 'date-fns';

function ZawodnicyPage() {
  const [zawodnicy, setZawodnicy] = useState([]);
  const [druzyny, setDruzyny] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingZawodnik, setEditingZawodnik] = useState(null);
  const [selectedDruzyna, setSelectedDruzyna] = useState('');
  const [formData, setFormData] = useState({
    imie: '',
    nazwisko: '',
    dataUrodzenia: '',
    okresWaznosciBadan: '',
    druzyna: ''
  });

  useEffect(() => {
    loadDruzyny();
    loadZawodnicy();
  }, []);

  const loadDruzyny = async () => {
    try {
      const response = await druzynyService.getAll();
      setDruzyny(response.data);
      if (response.data.length > 0 && !selectedDruzyna) {
        setSelectedDruzyna(response.data[0]._id);
      }
    } catch (error) {
      console.error('Błąd ładowania drużyn:', error);
    }
  };

  const loadZawodnicy = async (druzynaId = null) => {
    try {
      const response = druzynaId 
        ? await zawodnicyService.getByDruzyna(druzynaId)
        : await zawodnicyService.getAll();
      setZawodnicy(response.data);
    } catch (error) {
      console.error('Błąd ładowania zawodników:', error);
    }
  };

  const handleDruzynaFilter = (druzynaId) => {
    setSelectedDruzyna(druzynaId);
    if (druzynaId) {
      loadZawodnicy(druzynaId);
    } else {
      loadZawodnicy();
    }
  };

  const handleOpenDialog = (zawodnik = null) => {
    if (zawodnik) {
      setEditingZawodnik(zawodnik);
      setFormData({
        imie: zawodnik.imie,
        nazwisko: zawodnik.nazwisko,
        dataUrodzenia: zawodnik.dataUrodzenia ? format(new Date(zawodnik.dataUrodzenia), 'yyyy-MM-dd') : '',
        okresWaznosciBadan: zawodnik.okresWaznosciBadan ? format(new Date(zawodnik.okresWaznosciBadan), 'yyyy-MM-dd') : '',
        druzyna: zawodnik.druzyna._id || zawodnik.druzyna
      });
    } else {
      setEditingZawodnik(null);
      setFormData({
        imie: '',
        nazwisko: '',
        dataUrodzenia: '',
        okresWaznosciBadan: '',
        druzyna: selectedDruzyna || ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingZawodnik(null);
  };

  const handleSave = async () => {
    try {
      if (editingZawodnik) {
        await zawodnicyService.update(editingZawodnik._id, formData);
      } else {
        await zawodnicyService.create(formData);
      }
      handleCloseDialog();
      loadZawodnicy(selectedDruzyna || null);
    } catch (error) {
      console.error('Błąd zapisywania zawodnika:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Czy na pewno chcesz usunąć tego zawodnika?')) {
      try {
        await zawodnicyService.delete(id);
        loadZawodnicy(selectedDruzyna || null);
      } catch (error) {
        console.error('Błąd usuwania zawodnika:', error);
      }
    }
  };

  const isBadaniaWazne = (data) => {
    return new Date(data) > new Date();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Zawodnicy</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filtruj po drużynie</InputLabel>
            <Select
              value={selectedDruzyna}
              onChange={(e) => handleDruzynaFilter(e.target.value)}
              label="Filtruj po drużynie"
            >
              <MenuItem value="">Wszystkie drużyny</MenuItem>
              {druzyny.map((druzyna) => (
                <MenuItem key={druzyna._id} value={druzyna._id}>
                  {druzyna.nazwa}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Dodaj zawodnika
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Imię</TableCell>
              <TableCell>Nazwisko</TableCell>
              <TableCell>Data urodzenia</TableCell>
              <TableCell>Drużyna</TableCell>
              <TableCell>Badania lekarskie</TableCell>
              <TableCell>Dokumenty</TableCell>
              <TableCell align="right">Akcje</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {zawodnicy.map((zawodnik) => (
              <TableRow key={zawodnik._id}>
                <TableCell>{zawodnik.imie}</TableCell>
                <TableCell>{zawodnik.nazwisko}</TableCell>
                <TableCell>
                  {zawodnik.dataUrodzenia ? format(new Date(zawodnik.dataUrodzenia), 'dd.MM.yyyy') : '-'}
                </TableCell>
                <TableCell>{zawodnik.druzyna?.nazwa || '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={zawodnik.okresWaznosciBadan ? format(new Date(zawodnik.okresWaznosciBadan), 'dd.MM.yyyy') : 'Brak'}
                    color={isBadaniaWazne(zawodnik.okresWaznosciBadan) ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    icon={<AttachFile />}
                    label={zawodnik.dokumenty?.length || 0}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpenDialog(zawodnik)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(zawodnik._id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingZawodnik ? 'Edytuj zawodnika' : 'Dodaj zawodnika'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Imię"
              value={formData.imie}
              onChange={(e) => setFormData({ ...formData, imie: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Nazwisko"
              value={formData.nazwisko}
              onChange={(e) => setFormData({ ...formData, nazwisko: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Data urodzenia"
              type="date"
              value={formData.dataUrodzenia}
              onChange={(e) => setFormData({ ...formData, dataUrodzenia: e.target.value })}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Okres ważności badań lekarskich"
              type="date"
              value={formData.okresWaznosciBadan}
              onChange={(e) => setFormData({ ...formData, okresWaznosciBadan: e.target.value })}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth required>
              <InputLabel>Drużyna</InputLabel>
              <Select
                value={formData.druzyna}
                onChange={(e) => setFormData({ ...formData, druzyna: e.target.value })}
                label="Drużyna"
              >
                {druzyny.map((druzyna) => (
                  <MenuItem key={druzyna._id} value={druzyna._id}>
                    {druzyna.nazwa}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Anuluj</Button>
          <Button onClick={handleSave} variant="contained">
            Zapisz
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ZawodnicyPage;
