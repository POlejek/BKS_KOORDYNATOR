import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { zawodnicyService, planySzkolenioweService, obecnosciService } from '../services';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { pl } from 'date-fns/locale';

function PlayerPage() {
  const { id } = useParams();
  const [zawodnik, setZawodnik] = useState(null);
  const [startMonth, setStartMonth] = useState(() => new Date());
  const [endMonth, setEndMonth] = useState(() => new Date());
  const [stats, setStats] = useState({ treningi: 0, fazyGry: {}, dna: {}, celeMentalne: {}, celeMotoryczne: {} });

  useEffect(() => {
    loadZawodnik();
  }, [id]);

  useEffect(() => {
    if (zawodnik) loadStats();
  }, [zawodnik, startMonth, endMonth]);

  const loadZawodnik = async () => {
    try {
      const resp = await zawodnicyService.getById(id);
      setZawodnik(resp.data);
    } catch (err) {
      console.error('Błąd ładowania zawodnika:', err);
    }
  };

  const loadStats = async () => {
    try {
      const dataOd = format(startOfMonth(startMonth), 'yyyy-MM-dd');
      const dataDo = format(endOfMonth(endMonth), 'yyyy-MM-dd');

      const [planyRes, obecnosciRes] = await Promise.all([
        planySzkolenioweService.getByDruzyna(zawodnik.druzyna._id || zawodnik.druzyna, { dataOd, dataDo }),
        obecnosciService.getByZawodnik(id, { dataOd, dataDo }).catch(() => ({ data: [] }))
      ]);

      // map plans by date
      const planyByDate = {};
      planyRes.data.forEach(p => {
        const d = format(new Date(p.dataTreningu), 'yyyy-MM-dd');
        planyByDate[d] = p;
      });

      // Filter obecnosci for obecny and trainings
      const obecnosci = (obecnosciRes.data || []).filter(o => o.status === 'obecny');

      const treningi = [];
      const fazyGry = {};
      const dna = {};
      const celeMentalne = {};
      const celeMotoryczne = {};

      obecnosci.forEach(o => {
        const d = format(new Date(o.dataTreningu), 'yyyy-MM-dd');
        const plan = planyByDate[d];
        if (plan && plan.typWydarzenia === 'trening') {
          treningi.push(d);
          if (plan.dominujacaFazaGry) fazyGry[plan.dominujacaFazaGry] = (fazyGry[plan.dominujacaFazaGry] || 0) + 1;
          (plan.dnaTechniki || []).forEach(x => { if (x) dna[x] = (dna[x] || 0) + 1; });
          (plan.celMentalny || []).forEach(x => { if (x) celeMentalne[x] = (celeMentalne[x] || 0) + 1; });
          (plan.celMotoryczny || []).forEach(x => { if (x) celeMotoryczne[x] = (celeMotoryczne[x] || 0) + 1; });
        }
      });

      setStats({ treningi: treningi.length, fazyGry, dna, celeMentalne, celeMotoryczne });
    } catch (err) {
      console.error('Błąd ładowania statystyk zawodnika:', err);
    }
  };

  const generateMonthsOptions = (monthsRange = 12) => {
    const now = new Date();
    const options = [];
    for (let i = -monthsRange; i <= monthsRange; i++) options.push(new Date(now.getFullYear(), now.getMonth() + i, 1));
    return options;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Zawodnik</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Start miesiąc</InputLabel>
            <Select value={format(startMonth, 'yyyy-MM')} onChange={(e) => setStartMonth(new Date(e.target.value + '-01'))} label="Start miesiąc">
              {generateMonthsOptions(12).map((d, i) => (
                <MenuItem key={i} value={format(d, 'yyyy-MM')}>{format(d, 'LLLL yyyy', { locale: pl })}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>End miesiąc</InputLabel>
            <Select value={format(endMonth, 'yyyy-MM')} onChange={(e) => setEndMonth(new Date(e.target.value + '-01'))} label="End miesiąc">
              {generateMonthsOptions(12).map((d, i) => (
                <MenuItem key={i} value={format(d, 'yyyy-MM')}>{format(d, 'LLLL yyyy', { locale: pl })}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {zawodnik && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">{zawodnik.imie} {zawodnik.nazwisko}</Typography>
              <Typography variant="body2">Status: {zawodnik.status || (zawodnik.aktywny ? 'AKTYWNY' : 'NIEAKTYWNY')}</Typography>
              {zawodnik.statusKomentarz && <Typography variant="body2">Powód: {zawodnik.statusKomentarz}</Typography>}
              <Box sx={{ mt: 2 }}>
                {zawodnik.mail1 && <div>Mail 1: {zawodnik.mail1}</div>}
                {zawodnik.mail2 && <div>Mail 2: {zawodnik.mail2}</div>}
                {zawodnik.telefon1 && <div>Tel 1: {zawodnik.telefon1}</div>}
                {zawodnik.telefon2 && <div>Tel 2: {zawodnik.telefon2}</div>}
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Statystyki (w wybranym okresie)</Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body1">Ilość odbytych treningów: <strong>{stats.treningi}</strong></Typography>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Dominujące fazy gry</Typography>
                  {Object.keys(stats.fazyGry).length > 0 ? Object.entries(stats.fazyGry).map(([k, v]) => (
                    <div key={k}>{k}: {v}</div>
                  )) : <Typography variant="body2" color="text.secondary">Brak danych</Typography>}
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">DNA techniki</Typography>
                  {Object.keys(stats.dna).length > 0 ? Object.entries(stats.dna).map(([k, v]) => (
                    <div key={k}>{k}: {v}</div>
                  )) : <Typography variant="body2" color="text.secondary">Brak danych</Typography>}
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Cele mentalne</Typography>
                  {Object.keys(stats.celeMentalne).length > 0 ? Object.entries(stats.celeMentalne).map(([k, v]) => (
                    <div key={k}>{k}: {v}</div>
                  )) : <Typography variant="body2" color="text.secondary">Brak danych</Typography>}
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Cele motoryczne</Typography>
                  {Object.keys(stats.celeMotoryczne).length > 0 ? Object.entries(stats.celeMotoryczne).map(([k, v]) => (
                    <div key={k}>{k}: {v}</div>
                  )) : <Typography variant="body2" color="text.secondary">Brak danych</Typography>}
                </Box>

              </Box>
            </Paper>
          </Grid>

        </Grid>
      )}
    </Box>
  );
}

export default PlayerPage;
