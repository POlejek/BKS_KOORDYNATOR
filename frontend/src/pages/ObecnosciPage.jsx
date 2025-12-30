import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton
} from '@mui/material';
import { Check, Close, AccessTime, SportsScore, FitnessCenter } from '@mui/icons-material';
import { druzynyService, zawodnicyService, obecnosciService, planySzkolenioweService } from '../services';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, isSameDay } from 'date-fns';
import { pl } from 'date-fns/locale';

function ObecnosciPage() {
  const [druzyny, setDruzyny] = useState([]);
  const [selectedDruzyna, setSelectedDruzyna] = useState('');
  const [zawodnicy, setZawodnicy] = useState([]);
  const [obecnosci, setObecnosci] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [dniTreningowe, setDniTreningowe] = useState([]);
  const [dniMeczowe, setDniMeczowe] = useState([]);

  useEffect(() => {
    loadDruzyny();
  }, []);

  useEffect(() => {
    if (selectedDruzyna) {
      loadZawodnicy();
      loadObecnosci();
      loadPlanyTreningowe();
    }
  }, [selectedDruzyna, selectedMonth]);

  const generateMonthsOptions = (monthsRange = 12) => {
    const now = new Date();
    const options = [];
    for (let i = -monthsRange; i <= monthsRange; i++) {
      options.push(new Date(now.getFullYear(), now.getMonth() + i, 1));
    }
    return options;
  };

  const [selectedDateForAll, setSelectedDateForAll] = useState('');

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

  const loadZawodnicy = async () => {
    try {
      const response = await zawodnicyService.getByDruzyna(selectedDruzyna);
      setZawodnicy(response.data);
    } catch (error) {
      console.error('Błąd ładowania zawodników:', error);
    }
  };

  const loadObecnosci = async () => {
    try {
      const dataOd = format(startOfMonth(selectedMonth), 'yyyy-MM-dd');
      const dataDo = format(endOfMonth(selectedMonth), 'yyyy-MM-dd');
      const response = await obecnosciService.getByDruzyna(selectedDruzyna, { dataOd, dataDo });
      setObecnosci(response.data);
    } catch (error) {
      console.error('Błąd ładowania obecności:', error);
    }
  };

  const loadPlanyTreningowe = async () => {
    try {
      const dataOd = format(startOfMonth(selectedMonth), 'yyyy-MM-dd');
      const dataDo = format(endOfMonth(selectedMonth), 'yyyy-MM-dd');
      const response = await planySzkolenioweService.getByDruzyna(selectedDruzyna, { dataOd, dataDo });
      
      // Automatycznie oznacz dni na podstawie planów
      const treningowe = [];
      const meczowe = [];
      
      response.data.forEach(plan => {
        const dataStr = format(new Date(plan.dataTreningu), 'yyyy-MM-dd');
        if (plan.typWydarzenia === 'mecz') {
          meczowe.push(dataStr);
        } else {
          treningowe.push(dataStr);
        }
      });
      
      setDniTreningowe(treningowe);
      setDniMeczowe(meczowe);
    } catch (error) {
      console.error('Błąd ładowania planów treningowych:', error);
    }
  };

  const handleStatusChange = async (zawodnikId, data, nowyStatus) => {
    try {
      await obecnosciService.upsert(selectedDruzyna, {
        zawodnikId,
        dataTreningu: data,
        status: nowyStatus
      });
      loadObecnosci();
    } catch (error) {
      console.error('Błąd zapisywania obecności:', error);
    }
  };

  const getStatusForDate = (zawodnikId, data) => {
    const obecnosc = obecnosci.find(
      (o) => o.zawodnik._id === zawodnikId && isSameDay(new Date(o.dataTreningu), data)
    );
    return obecnosc?.status || null;
  };

  const getTypDnia = (data) => {
    const dataStr = format(data, 'yyyy-MM-dd');
    if (dniTreningowe.includes(dataStr)) return 'trening';
    if (dniMeczowe.includes(dataStr)) return 'mecz';
    return null;
  };

  const dniMiesiaca = eachDayOfInterval({
    start: startOfMonth(selectedMonth),
    end: endOfMonth(selectedMonth)
  }).filter(day => !isWeekend(day));

  const statusColors = {
    obecny: 'success',
    nieobecny: 'error',
    usprawiedliwiony: 'warning',
    spozniony: 'info'
  };

  const statusIcons = {
    obecny: <Check />,
    nieobecny: <Close />,
    usprawiedliwiony: <Check />,
    spozniony: <AccessTime />
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Lista obecności</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Drużyna</InputLabel>
            <Select
              value={selectedDruzyna}
              onChange={(e) => setSelectedDruzyna(e.target.value)}
              label="Drużyna"
            >
              {druzyny.map((druzyna) => (
                <MenuItem key={druzyna._id} value={druzyna._id}>
                  {druzyna.nazwa}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Miesiąc</InputLabel>
            <Select
              value={format(selectedMonth, 'yyyy-MM')}
              onChange={(e) => setSelectedMonth(new Date(e.target.value + '-01'))}
              label="Miesiąc"
            >
              {generateMonthsOptions(12).map((date, i) => (
                <MenuItem key={i} value={format(date, 'yyyy-MM')}>
                  {format(date, 'LLLL yyyy', { locale: pl })}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Data (do masowego oznaczania)</InputLabel>
            <Select
              value={selectedDateForAll}
              onChange={(e) => setSelectedDateForAll(e.target.value)}
              label="Data (do masowego oznaczania)"
            >
              {dniMiesiaca.map((d) => (
                <MenuItem key={d.toString()} value={format(d, 'yyyy-MM-dd')}>
                  {format(d, 'dd LLL yyyy', { locale: pl })}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" onClick={async () => {
            if (!selectedDateForAll) return alert('Wybierz datę');
            if (!window.confirm('Oznaczyć obecny dla wszystkich zawodników na wybraną datę?')) return;
            try {
              await Promise.all(zawodnicy.map(z => obecnosciService.upsert(selectedDruzyna, {
                zawodnikId: z._id,
                dataTreningu: selectedDateForAll,
                status: 'obecny'
              })));
              loadObecnosci();
              alert('Oznaczono obecny dla wszystkich');
            } catch (err) {
              console.error('Błąd oznaczania obecnych:', err);
              alert('Błąd oznaczania obecnych');
            }
          }}>Oznacz obecny dla wszystkich</Button>
        </Box>
      </Box>

      {selectedDruzyna && (
        <>
          <Paper sx={{ mb: 2, p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Daty treningów i meczów z planu szkoleniowego:
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Dni są automatycznie ładowane z planu szkoleniowego. Dodaj wydarzenia w zakładce "Plan Szkoleniowy".
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {dniMiesiaca
                .filter(d => getTypDnia(d))
                .map((dzien) => {
                const typDnia = getTypDnia(dzien);
                return (
                  <Chip
                    key={dzien.toString()}
                    label={format(dzien, 'dd MMM', { locale: pl })}
                    color={typDnia === 'trening' ? 'primary' : 'secondary'}
                    variant="filled"
                    icon={typDnia === 'trening' ? <FitnessCenter /> : <SportsScore />}
                  />
                );
              })}
            </Box>
          </Paper>

          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Zawodnik</TableCell>
                  {dniMiesiaca
                    .filter(d => getTypDnia(d))
                    .map((dzien) => {
                      const typDnia = getTypDnia(dzien);
                      return (
                        <TableCell 
                          key={dzien.toString()} 
                          align="center"
                          sx={{ 
                            bgcolor: typDnia === 'trening' ? 'primary.light' : 'secondary.light',
                            color: 'white'
                          }}
                        >
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                            {typDnia === 'trening' ? <FitnessCenter fontSize="small" /> : <SportsScore fontSize="small" />}
                            <Typography variant="caption">
                              {format(dzien, 'dd')}
                              <br />
                              {format(dzien, 'EEE', { locale: pl })}
                            </Typography>
                          </Box>
                        </TableCell>
                      );
                    })}
                </TableRow>
              </TableHead>
              <TableBody>
                {zawodnicy.map((zawodnik) => (
                  <TableRow key={zawodnik._id}>
                    <TableCell>
                      {zawodnik.imie} {zawodnik.nazwisko}
                    </TableCell>
                    {dniMiesiaca
                      .filter(d => getTypDnia(d))
                      .map((dzien) => {
                        const status = getStatusForDate(zawodnik._id, dzien);
                        return (
                          <TableCell key={dzien.toString()} align="center">
                            <FormControl size="small" fullWidth>
                              <Select
                                value={status || ''}
                                onChange={(e) => handleStatusChange(zawodnik._id, dzien, e.target.value)}
                                displayEmpty
                                sx={{ minWidth: 80 }}
                              >
                                <MenuItem value="">-</MenuItem>
                                <MenuItem value="obecny">Obecny</MenuItem>
                                <MenuItem value="nieobecny">Nieobecny</MenuItem>
                                <MenuItem value="usprawiedliwiony">Uspraw.</MenuItem>
                                <MenuItem value="spozniony">Spóźniony</MenuItem>
                              </Select>
                            </FormControl>
                          </TableCell>
                        );
                      })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
}

export default ObecnosciPage;
