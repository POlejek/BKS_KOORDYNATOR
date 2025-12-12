import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Save as SaveIcon } from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';
import { zawodnicyService, druzynyService, kontroleMeczoweService, planySzkolenioweService } from '../services';

function KontrolaMeczowaPage() {
  const [kontrole, setKontrole] = useState([]);
  const [zawodnicy, setZawodnicy] = useState([]);
  const [druzyny, setDruzyny] = useState([]);
  const [selectedDruzyna, setSelectedDruzyna] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [newMecz, setNewMecz] = useState({
    dataMeczu: format(new Date(), 'yyyy-MM-dd'),
    przeciwnik: '',
    wynik: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDruzyny();
  }, []);

  useEffect(() => {
    if (selectedDruzyna) {
      loadData();
    }
  }, [selectedDruzyna]);

  const loadDruzyny = async () => {
    try {
      const response = await druzynyService.getAll();
      setDruzyny(response.data);
      if (response.data.length > 0) {
        setSelectedDruzyna(response.data[0]._id);
      }
    } catch (error) {
      showSnackbar('Błąd ładowania drużyn', 'error');
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [zawodnicyRes, kontroleRes, planyRes] = await Promise.all([
        zawodnicyService.getByDruzyna(selectedDruzyna),
        kontroleMeczoweService.getAll(selectedDruzyna),
        planySzkolenioweService.getByDruzyna(selectedDruzyna)
      ]);
      
      setZawodnicy(zawodnicyRes.data);
      
      // Znajdź mecze z planów treningowych (typWydarzenia === 'mecz')
      const meczeZPlanow = planyRes.data.filter(plan => plan.typWydarzenia === 'mecz');
      const istniejaceKontrole = kontroleRes.data;
      
      // Automatycznie twórz kontrole meczowe dla meczów, które nie mają jeszcze kontroli
      for (const mecz of meczeZPlanow) {
        const meczData = format(new Date(mecz.dataTreningu), 'yyyy-MM-dd');
        const istniejeKontrola = istniejaceKontrole.some(k => 
          format(new Date(k.dataMeczu), 'yyyy-MM-dd') === meczData
        );
        
        if (!istniejeKontrola) {
          // Utwórz nową kontrolę meczową
          const statystykiZawodnikow = zawodnicyRes.data.map(z => ({
            zawodnikId: z._id,
            ileMinut: 0,
            ileAsyst: 0,
            ileBramek: 0,
            status: 'MN'
          }));
          
          try {
            const nowaKontrola = await kontroleMeczoweService.create({
              dataMeczu: mecz.dataTreningu,
              przeciwnik: mecz.opisCelow || 'Mecz',
              wynik: '',
              druzynaId: selectedDruzyna,
              statystykiZawodnikow
            });
            istniejaceKontrole.push(nowaKontrola.data);
          } catch (err) {
            console.error('Błąd tworzenia kontroli meczowej:', err);
          }
        }
      }
      
      // Sprawdź czy wszystkie kontrole mają statystyki dla wszystkich zawodników
      // Jeśli dodano nowych zawodników, dodaj ich do istniejących kontroli
      for (const kontrola of istniejaceKontrole) {
        let updated = false;
        const istniejaceZawodnicyIds = kontrola.statystykiZawodnikow.map(s => s.zawodnikId._id || s.zawodnikId);
        
        for (const zawodnik of zawodnicyRes.data) {
          if (!istniejaceZawodnicyIds.includes(zawodnik._id)) {
            // Dodaj brakującego zawodnika do statystyk
            kontrola.statystykiZawodnikow.push({
              zawodnikId: zawodnik,
              ileMinut: 0,
              ileAsyst: 0,
              ileBramek: 0,
              status: 'MN'
            });
            updated = true;
          }
        }
        
        // Jeśli dodano nowych zawodników, zaktualizuj kontrolę w bazie
        if (updated) {
          try {
            await kontroleMeczoweService.update(kontrola._id, kontrola);
          } catch (err) {
            console.error('Błąd aktualizacji kontroli meczowej:', err);
          }
        }
      }
      
      setKontrole(istniejaceKontrole);
    } catch (error) {
      showSnackbar('Błąd ładowania danych', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMecz = async () => {
    try {
      if (!newMecz.przeciwnik) {
        showSnackbar('Podaj przeciwnika', 'warning');
        return;
      }

      const statystykiZawodnikow = zawodnicy.map(z => ({
        zawodnikId: z._id,
        ileMinut: 0,
        ileAsyst: 0,
        ileBramek: 0,
        status: 'MN'
      }));

      // Utwórz kontrolę meczową
      await kontroleMeczoweService.create({
        ...newMecz,
        druzynaId: selectedDruzyna,
        statystykiZawodnikow
      });

      // Synchronizacja: Dodaj również mecz do Planu Szkoleniowego
      try {
        await planySzkolenioweService.create({
          dataTreningu: newMecz.dataMeczu,
          typWydarzenia: 'mecz',
          druzynaId: selectedDruzyna,
          dominujacaFazaGry: '',
          dnaTechniki: [],
          celMotoryczny: [],
          celMentalny: [],
          opisCelow: newMecz.przeciwnik,
          zalozenia: '',
          cwiczenia: ['', '', '', '', ''],
          numerTreningWTygodniu: 0
        });
      } catch (err) {
        console.error('Błąd dodawania meczu do planu szkoleniowego:', err);
        // Nie przerywamy procesu, mecz został dodany do kontroli
      }

      showSnackbar('Mecz dodany pomyślnie', 'success');
      setOpenDialog(false);
      setNewMecz({
        dataMeczu: format(new Date(), 'yyyy-MM-dd'),
        przeciwnik: '',
        wynik: ''
      });
      loadData();
    } catch (error) {
      showSnackbar('Błąd dodawania meczu', 'error');
    }
  };

  const handleUpdateStat = async (kontrolaId, zawodnikId, field, value) => {
    try {
      const kontrola = kontrole.find(k => k._id === kontrolaId);
      const updatedStats = kontrola.statystykiZawodnikow.map(stat => {
        if (stat.zawodnikId._id === zawodnikId) {
          return { ...stat, [field]: value };
        }
        return stat;
      });

      await kontroleMeczoweService.update(kontrolaId, {
        ...kontrola,
        statystykiZawodnikow: updatedStats
      });

      setKontrole(prev => prev.map(k => 
        k._id === kontrolaId 
          ? { ...k, statystykiZawodnikow: updatedStats }
          : k
      ));
    } catch (error) {
      showSnackbar('Błąd aktualizacji', 'error');
    }
  };

  const handleUpdateMeczInfo = async (kontrolaId, field, value) => {
    try {
      const kontrola = kontrole.find(k => k._id === kontrolaId);
      await kontroleMeczoweService.update(kontrolaId, {
        ...kontrola,
        [field]: value
      });

      setKontrole(prev => prev.map(k => 
        k._id === kontrolaId 
          ? { ...k, [field]: value }
          : k
      ));
    } catch (error) {
      showSnackbar('Błąd aktualizacji', 'error');
    }
  };

  const handleDeleteMecz = async (kontrolaId) => {
    if (window.confirm('Czy na pewno chcesz usunąć ten mecz? Zostanie również usunięty z Planu Szkoleniowego.')) {
      try {
        const kontrola = kontrole.find(k => k._id === kontrolaId);
        
        // Usuń kontrolę meczową
        await kontroleMeczoweService.delete(kontrolaId);
        
        // Synchronizacja: Usuń również odpowiadający mecz z Planu Szkoleniowego
        try {
          const planyRes = await planySzkolenioweService.getByDruzyna(selectedDruzyna);
          const meczWPlanie = planyRes.data.find(plan => 
            plan.typWydarzenia === 'mecz' &&
            format(new Date(plan.dataTreningu), 'yyyy-MM-dd') === format(new Date(kontrola.dataMeczu), 'yyyy-MM-dd')
          );
          
          if (meczWPlanie) {
            await planySzkolenioweService.delete(meczWPlanie._id);
          }
        } catch (err) {
          console.error('Błąd usuwania meczu z planu szkoleniowego:', err);
        }
        
        showSnackbar('Mecz usunięty pomyślnie', 'success');
        loadData();
      } catch (error) {
        showSnackbar('Błąd usuwania meczu', 'error');
      }
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const getStatForZawodnik = (kontrola, zawodnikId) => {
    return kontrola.statystykiZawodnikow.find(s => s.zawodnikId._id === zawodnikId);
  };

  const statusColors = {
    MP: '#4caf50',
    MR: '#ff9800',
    MN: '#f44336'
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Kontrola Meczowa</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Drużyna</InputLabel>
            <Select
              value={selectedDruzyna}
              onChange={(e) => setSelectedDruzyna(e.target.value)}
              label="Drużyna"
            >
              {druzyny.map((d) => (
                <MenuItem key={d._id} value={d._id}>
                  {d.nazwa} ({d.rocznik})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Dodaj mecz
          </Button>
        </Box>
      </Box>

      {kontrole.length === 0 ? (
        <Alert severity="info">Brak meczów. Dodaj pierwszy mecz!</Alert>
      ) : (
        <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 250px)' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', minWidth: 200, position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 3 }}>
                  Zawodnik
                </TableCell>
                {kontrole.map((kontrola) => (
                  <TableCell
                    key={kontrola._id}
                    align="center"
                    sx={{ 
                      minWidth: 180,
                      borderLeft: '2px solid #ddd',
                      bgcolor: '#f5f5f5'
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {format(parseISO(kontrola.dataMeczu), 'dd.MM.yyyy', { locale: pl })}
                      </Typography>
                      <TextField
                        value={kontrola.przeciwnik}
                        onChange={(e) => handleUpdateMeczInfo(kontrola._id, 'przeciwnik', e.target.value)}
                        size="small"
                        placeholder="Przeciwnik"
                        sx={{ mt: 0.5, mb: 0.5 }}
                        variant="outlined"
                      />
                      <TextField
                        value={kontrola.wynik}
                        onChange={(e) => handleUpdateMeczInfo(kontrola._id, 'wynik', e.target.value)}
                        size="small"
                        placeholder="Wynik"
                        sx={{ mb: 0.5 }}
                        variant="outlined"
                      />
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteMecz(kontrola._id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell sx={{ position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 3 }} />
                {kontrole.map((kontrola) => (
                  <TableCell
                    key={`header-${kontrola._id}`}
                    align="center"
                    sx={{ borderLeft: '2px solid #ddd', fontSize: '0.75rem', p: 1 }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography variant="caption">Min / Asysty / Bramki / Status</Typography>
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {zawodnicy.map((zawodnik) => (
                <TableRow key={zawodnik._id} hover>
                  <TableCell 
                    sx={{ 
                      fontWeight: 500,
                      position: 'sticky',
                      left: 0,
                      bgcolor: 'background.paper',
                      zIndex: 2
                    }}
                  >
                    {zawodnik.imie} {zawodnik.nazwisko}
                  </TableCell>
                  {kontrole.map((kontrola) => {
                    const stat = getStatForZawodnik(kontrola, zawodnik._id);
                    if (!stat) return <TableCell key={`${kontrola._id}-${zawodnik._id}`} />;
                    
                    return (
                      <TableCell
                        key={`${kontrola._id}-${zawodnik._id}`}
                        align="center"
                        sx={{ borderLeft: '2px solid #ddd', p: 1 }}
                      >
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                            <TextField
                              type="number"
                              value={stat.ileMinut}
                              onChange={(e) => handleUpdateStat(kontrola._id, zawodnik._id, 'ileMinut', parseInt(e.target.value) || 0)}
                              size="small"
                              inputProps={{ min: 0, max: 120, style: { textAlign: 'center', padding: '4px' } }}
                              sx={{ width: 50 }}
                            />
                            <TextField
                              type="number"
                              value={stat.ileAsyst}
                              onChange={(e) => handleUpdateStat(kontrola._id, zawodnik._id, 'ileAsyst', parseInt(e.target.value) || 0)}
                              size="small"
                              inputProps={{ min: 0, style: { textAlign: 'center', padding: '4px' } }}
                              sx={{ width: 45 }}
                            />
                            <TextField
                              type="number"
                              value={stat.ileBramek}
                              onChange={(e) => handleUpdateStat(kontrola._id, zawodnik._id, 'ileBramek', parseInt(e.target.value) || 0)}
                              size="small"
                              inputProps={{ min: 0, style: { textAlign: 'center', padding: '4px' } }}
                              sx={{ width: 45 }}
                            />
                          </Box>
                          <Select
                            value={stat.status}
                            onChange={(e) => handleUpdateStat(kontrola._id, zawodnik._id, 'status', e.target.value)}
                            size="small"
                            sx={{ 
                              width: 50,
                              bgcolor: statusColors[stat.status],
                              color: 'white',
                              '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                              fontSize: '0.75rem',
                              '& .MuiSelect-select': { padding: '4px', textAlign: 'center' }
                            }}
                          >
                            <MenuItem value="MP">MP</MenuItem>
                            <MenuItem value="MR">MR</MenuItem>
                            <MenuItem value="MN">MN</MenuItem>
                          </Select>
                        </Box>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Dodaj nowy mecz</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2, minWidth: 400 }}>
            <TextField
              label="Data meczu"
              type="date"
              value={newMecz.dataMeczu}
              onChange={(e) => setNewMecz({ ...newMecz, dataMeczu: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Przeciwnik"
              value={newMecz.przeciwnik}
              onChange={(e) => setNewMecz({ ...newMecz, przeciwnik: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Wynik (opcjonalnie)"
              value={newMecz.wynik}
              onChange={(e) => setNewMecz({ ...newMecz, wynik: e.target.value })}
              placeholder="np. 3:1"
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Anuluj</Button>
          <Button onClick={handleAddMecz} variant="contained">
            Dodaj
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default KontrolaMeczowaPage;
