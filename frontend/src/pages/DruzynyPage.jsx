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
  IconButton
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { druzynyService } from '../services';

function DruzynyPage() {
  const [druzyny, setDruzyny] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDruzyna, setEditingDruzyna] = useState(null);
  const [formData, setFormData] = useState({
    nazwa: '',
    rocznik: '',
    trener: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDruzyny();
  }, []);

  const loadDruzyny = async () => {
    try {
      const response = await druzynyService.getAll();
      setDruzyny(response.data);
    } catch (error) {
      console.error('Błąd ładowania drużyn:', error);
    }
  };

  const handleOpenDialog = (druzyna = null) => {
    if (druzyna) {
      setEditingDruzyna(druzyna);
      setFormData({
        nazwa: druzyna.nazwa,
        rocznik: druzyna.rocznik,
        trener: druzyna.trener
      });
    } else {
      setEditingDruzyna(null);
      setFormData({ nazwa: '', rocznik: '', trener: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingDruzyna(null);
    setFormData({ nazwa: '', rocznik: '', trener: '' });
  };

  const handleSave = async () => {
    // Client-side validation
    if (!formData.nazwa || !formData.rocznik || !formData.trener) {
      setError('Uzupełnij wszystkie wymagane pola: nazwa, rocznik i trener.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (editingDruzyna) {
        await druzynyService.update(editingDruzyna._id, formData);
      } else {
        await druzynyService.create(formData);
      }
      handleCloseDialog();
      loadDruzyny();
    } catch (err) {
      console.error('Błąd zapisywania drużyny:', err);
      // pokaż przyjazny komunikat użytkownikowi
      const msg = err?.response?.data?.message || err.message || 'Błąd zapisu drużyny';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Czy na pewno chcesz usunąć tę drużynę?')) {
      try {
        await druzynyService.delete(id);
        loadDruzyny();
      } catch (error) {
        console.error('Błąd usuwania drużyny:', error);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Drużyny</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Dodaj drużynę
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nazwa</TableCell>
              <TableCell>Rocznik</TableCell>
              <TableCell>Trener</TableCell>
              <TableCell align="right">Akcje</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {druzyny.map((druzyna) => (
              <TableRow key={druzyna._id}>
                <TableCell>{druzyna.nazwa}</TableCell>
                <TableCell>{druzyna.rocznik}</TableCell>
                <TableCell>{druzyna.trener}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpenDialog(druzyna)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(druzyna._id)} color="error">
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
          {editingDruzyna ? 'Edytuj drużynę' : 'Dodaj drużynę'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            {error && (
              <Box sx={{ mb: 1 }}>
                <Typography color="error">{error}</Typography>
              </Box>
            )}
            <TextField
              label="Nazwa drużyny"
              value={formData.nazwa}
              onChange={(e) => setFormData({ ...formData, nazwa: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Rocznik"
              value={formData.rocznik}
              onChange={(e) => setFormData({ ...formData, rocznik: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Trener"
              value={formData.trener}
              onChange={(e) => setFormData({ ...formData, trener: e.target.value })}
              fullWidth
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={saving}>Anuluj</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? 'Zapisuję...' : 'Zapisz'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default DruzynyPage;
