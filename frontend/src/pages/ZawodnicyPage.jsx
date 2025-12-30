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
import api from '../services/api';
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
    druzyna: '',
    status: 'AKTYWNY',
    statusKomentarz: '',
    dgaWazneDo: '',
    mail1: '',
    mail2: '',
    telefon1: '',
    telefon2: ''
  });
  const [plik, setPlik] = useState(null);
  const [dokumentTyp, setDokumentTyp] = useState('badania_lekarskie');

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
        druzyna: zawodnik.druzyna._id || zawodnik.druzyna,
        status: zawodnik.status || (zawodnik.aktywny ? 'AKTYWNY' : 'NIEAKTYWNY'),
        statusKomentarz: zawodnik.statusKomentarz || '',
        dgaWazneDo: zawodnik.dgaWazneDo ? format(new Date(zawodnik.dgaWazneDo), 'yyyy-MM-dd') : '',
        mail1: zawodnik.mail1 || '',
        mail2: zawodnik.mail2 || '',
        telefon1: zawodnik.telefon1 || '',
        telefon2: zawodnik.telefon2 || ''
      });
    } else {
      setEditingZawodnik(null);
      setFormData({
        imie: '',
        nazwisko: '',
        dataUrodzenia: '',
        okresWaznosciBadan: '',
        druzyna: selectedDruzyna || '',
        status: 'AKTYWNY',
        statusKomentarz: '',
        dgaWazneDo: '',
        mail1: '',
        mail2: '',
        telefon1: '',
        telefon2: ''
      });
      setPlik(null);
      setDokumentTyp('badania_lekarskie');
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
      alert(error.response?.data?.message || 'Błąd zapisywania zawodnika');
    }
  };

  const handleFileChange = (e) => {
    setPlik(e.target.files[0] || null);
  };

  const handleUploadDokument = async () => {
    if (!editingZawodnik) return;
    if (!plik) {
      alert('Wybierz plik do przesłania');
      return;
    }

    const fd = new FormData();
    fd.append('plik', plik);
    fd.append('typ', dokumentTyp);

    try {
      await zawodnicyService.addDokument(editingZawodnik._id, fd);
      const resp = await zawodnicyService.getById(editingZawodnik._id);
      setEditingZawodnik(resp.data);
      loadZawodnicy(selectedDruzyna || null);
      setPlik(null);
      setDokumentTyp('badania_lekarskie');
    } catch (err) {
      console.error('Błąd uploadu:', err);
      alert('Błąd przesyłania pliku');
    }
  };

  const handleDeleteDokument = async (dokumentId) => {
    if (!editingZawodnik) return;
    if (!window.confirm('Usunąć dokument?')) return;
    try {
      await zawodnicyService.deleteDokument(editingZawodnik._id, dokumentId);
      const resp = await zawodnicyService.getById(editingZawodnik._id);
      setEditingZawodnik(resp.data);
      loadZawodnicy(selectedDruzyna || null);
    } catch (err) {
      console.error('Błąd usuwania dokumentu:', err);
      alert('Błąd usuwania dokumentu');
    }
  };

  const makeDownloadUrl = (sciezkaPliku) => {
    if (!sciezkaPliku) return '#';
    const base = api.defaults.baseURL?.endsWith('/api') ? api.defaults.baseURL.slice(0, -4) : api.defaults.baseURL || '';
    return `${base}/${sciezkaPliku}`;
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
              <TableCell>Status</TableCell>
              <TableCell>DGA</TableCell>
              <TableCell>Kontakt</TableCell>
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
                <TableCell>{zawodnik.status || (zawodnik.aktywny ? 'AKTYWNY' : 'NIEAKTYWNY')}</TableCell>
                <TableCell>{zawodnik.dgaWazneDo ? format(new Date(zawodnik.dgaWazneDo), 'dd.MM.yyyy') : '-'}</TableCell>
                <TableCell>
                  {zawodnik.mail1 || zawodnik.telefon1 ? (
                    <div>
                      {zawodnik.mail1 && <div>{zawodnik.mail1}</div>}
                      {zawodnik.mail2 && <div>{zawodnik.mail2}</div>}
                      {zawodnik.telefon1 && <div>{zawodnik.telefon1}</div>}
                      {zawodnik.telefon2 && <div>{zawodnik.telefon2}</div>}
                    </div>
                  ) : '-'}
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
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                label="Status"
              >
                <MenuItem value="AKTYWNY">AKTYWNY</MenuItem>
                <MenuItem value="NIEAKTYWNY">NIEAKTYWNY</MenuItem>
              </Select>
            </FormControl>
            {formData.status === 'NIEAKTYWNY' && (
              <TextField
                label="Powód nieaktywności"
                value={formData.statusKomentarz}
                onChange={(e) => setFormData({ ...formData, statusKomentarz: e.target.value })}
                fullWidth
                required
              />
            )}
            <TextField
              label="DGA - data ważności"
              type="date"
              value={formData.dgaWazneDo}
              onChange={(e) => setFormData({ ...formData, dgaWazneDo: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Mail 1"
              value={formData.mail1}
              onChange={(e) => setFormData({ ...formData, mail1: e.target.value })}
              fullWidth
            />
            <TextField
              label="Mail 2"
              value={formData.mail2}
              onChange={(e) => setFormData({ ...formData, mail2: e.target.value })}
              fullWidth
            />
            <TextField
              label="Telefon 1"
              value={formData.telefon1}
              onChange={(e) => setFormData({ ...formData, telefon1: e.target.value })}
              fullWidth
            />
            <TextField
              label="Telefon 2"
              value={formData.telefon2}
              onChange={(e) => setFormData({ ...formData, telefon2: e.target.value })}
              fullWidth
            />
          </Box>
          {editingZawodnik && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Dokumenty</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {(editingZawodnik.dokumenty || []).map((dok) => (
                  <Box key={dok._id || dok.dataZaladowania} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip label={dok.typ === 'badania_lekarskie' ? 'Badania' : dok.typ === 'deklaracja_gry_amatora' ? 'DGA' : 'Inne'} size="small" />
                    <Typography sx={{ flex: 1 }}>{dok.nazwa}</Typography>
                    <Button size="small" onClick={() => window.open(makeDownloadUrl(dok.sciezkaPliku), '_blank')}>Pobierz</Button>
                    <Button size="small" color="error" onClick={() => handleDeleteDokument(dok._id)}>Usuń</Button>
                  </Box>
                ))}

                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
                  <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel>Typ dokumentu</InputLabel>
                    <Select
                      value={dokumentTyp}
                      label="Typ dokumentu"
                      onChange={(e) => setDokumentTyp(e.target.value)}
                    >
                      <MenuItem value="badania_lekarskie">Badania lekarskie</MenuItem>
                      <MenuItem value="deklaracja_gry_amatora">DGA</MenuItem>
                      <MenuItem value="inne">Inne</MenuItem>
                    </Select>
                  </FormControl>
                  <input type="file" onChange={handleFileChange} />
                  <Button variant="contained" onClick={handleUploadDokument}>Prześlij</Button>
                </Box>
              </Box>
            </Box>
          )}
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
