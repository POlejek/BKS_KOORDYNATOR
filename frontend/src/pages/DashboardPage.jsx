import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  SportsScore as SportsScoreIcon,
  EmojiEvents as TrophyIcon,
  FitnessCenter as FitnessIcon,
  People as PeopleIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';
import { druzynyService, zawodnicyService, kontroleMeczoweService, planySzkolenioweService, obecnosciService } from '../services';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { pl } from 'date-fns/locale';

function DashboardPage() {
  const [druzyny, setDruzyny] = useState([]);
  const [selectedDruzyna, setSelectedDruzyna] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [stats, setStats] = useState({
    treningi: {
      total: 0,
      mecze: 0,
      fazyGry: {},
      dnaTechniki: {},
      celeMentalne: {}
    },
    gracze: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDruzyny();
  }, []);

  useEffect(() => {
    if (selectedDruzyna) {
      loadStatistics();
    }
  }, [selectedDruzyna, selectedMonth]);

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

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const startDate = format(startOfMonth(selectedMonth), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(selectedMonth), 'yyyy-MM-dd');

      const [zawodnicyRes, kontroleRes, planyRes, obecnosciRes] = await Promise.all([
        zawodnicyService.getByDruzyna(selectedDruzyna),
        kontroleMeczoweService.getAll(selectedDruzyna),
        planySzkolenioweService.getByDruzyna(selectedDruzyna),
        obecnosciService.getAll().catch(() => ({ data: [] }))
      ]);

      // Filtruj plany według wybranego miesiąca
      const planyWMiesiacu = planyRes.data.filter(plan => {
        const planDate = new Date(plan.dataTreningu);
        return planDate >= new Date(startDate) && planDate <= new Date(endDate);
      });

      // Statystyki treningów
      const treningi = planyWMiesiacu.filter(p => p.typWydarzenia === 'trening');
      const mecze = planyWMiesiacu.filter(p => p.typWydarzenia === 'mecz');

      const fazyGry = {};
      const dnaTechniki = {};
      const celeMentalne = {};

      treningi.forEach(t => {
        if (t.dominujacaFazaGry) {
          fazyGry[t.dominujacaFazaGry] = (fazyGry[t.dominujacaFazaGry] || 0) + 1;
        }
        t.dnaTechniki?.forEach(dna => {
          if (dna) dnaTechniki[dna] = (dnaTechniki[dna] || 0) + 1;
        });
        t.celMentalny?.forEach(cel => {
          if (cel) celeMentalne[cel] = (celeMentalne[cel] || 0) + 1;
        });
      });

      // Statystyki graczy
      const graczStats = zawodnicyRes.data.map(zawodnik => {
        const kontroleZawodnika = kontroleRes.data.flatMap(k => 
          k.statystykiZawodnikow.filter(s => 
            (s.zawodnikId._id || s.zawodnikId) === zawodnik._id
          )
        );

        const meczeRozegrane = kontroleZawodnika.filter(s => s.status === 'MP' || s.status === 'MR').length;
        const sumaBramek = kontroleZawodnika.reduce((sum, s) => sum + (s.ileBramek || 0), 0);
        const sumaAsyst = kontroleZawodnika.reduce((sum, s) => sum + (s.ileAsyst || 0), 0);
        const sumaMinut = kontroleZawodnika.reduce((sum, s) => sum + (s.ileMinut || 0), 0);
        const sredniaMinut = meczeRozegrane > 0 ? Math.round(sumaMinut / meczeRozegrane) : 0;

        // Frekwencja (jeśli są dane z obecności)
        const obecnosciZawodnika = obecnosciRes.data
          .filter(o => o.druzynaId === selectedDruzyna)
          .flatMap(o => o.obecnosci.filter(ob => ob.zawodnikId === zawodnik._id));
        
        const frekwencja = obecnosciZawodnika.length > 0
          ? Math.round((obecnosciZawodnika.filter(o => o.status === 'obecny').length / obecnosciZawodnika.length) * 100)
          : 0;

        return {
          id: zawodnik._id,
          imie: zawodnik.imie,
          nazwisko: zawodnik.nazwisko,
          meczeRozegrane,
          sumaBramek,
          sumaAsyst,
          sumaMinut,
          sredniaMinut,
          frekwencja,
          punkty: sumaBramek + sumaAsyst // Punkty: bramki + asysty
        };
      });

      // Sortuj graczy według punktów
      graczStats.sort((a, b) => b.punkty - a.punkty);

      setStats({
        treningi: {
          total: treningi.length,
          mecze: mecze.length,
          fazyGry,
          dnaTechniki,
          celeMentalne
        },
        gracze: graczStats
      });
    } catch (error) {
      console.error('Błąd ładowania statystyk:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color = 'primary', subtitle }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              bgcolor: `${color}.light`,
              p: 1,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Icon color={color} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const getTopItems = (obj, limit = 5) => {
    return Object.entries(obj)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Dashboard - Statystyki</Typography>
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
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Miesiąc</InputLabel>
            <Select
              value={format(selectedMonth, 'yyyy-MM')}
              onChange={(e) => setSelectedMonth(new Date(e.target.value + '-01'))}
              label="Miesiąc"
            >
              {Array.from({ length: 12 }, (_, i) => {
                const date = new Date(2025, i, 1);
                return (
                  <MenuItem key={i} value={format(date, 'yyyy-MM')}>
                    {format(date, 'LLLL yyyy', { locale: pl })}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Moduł 1: Statystyki Treningów */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <FitnessIcon /> Statystyki Treningów
        </Typography>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Treningi"
              value={stats.treningi.total}
              icon={FitnessIcon}
              color="primary"
              subtitle="w wybranym miesiącu"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Mecze"
              value={stats.treningi.mecze}
              icon={SportsScoreIcon}
              color="secondary"
              subtitle="rozegrane"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Razem zajęć"
              value={stats.treningi.total + stats.treningi.mecze}
              icon={CalendarIcon}
              color="success"
              subtitle="treningi + mecze"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Średnia tygodniowo"
              value={Math.round((stats.treningi.total + stats.treningi.mecze) / 4)}
              icon={TrendingUpIcon}
              color="info"
              subtitle="zajęć na tydzień"
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Dominujące Fazy Gry
            </Typography>
            <Box>
              {getTopItems(stats.treningi.fazyGry).map(([faza, count]) => (
                <Box key={faza} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">{faza}</Typography>
                    <Typography variant="body2" fontWeight="bold">{count}x</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(count / stats.treningi.total) * 100}
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>
              ))}
              {Object.keys(stats.treningi.fazyGry).length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  Brak danych
                </Typography>
              )}
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              DNA Techniki (TOP 5)
            </Typography>
            <Box>
              {getTopItems(stats.treningi.dnaTechniki).map(([tech, count]) => (
                <Chip
                  key={tech}
                  label={`${tech} (${count})`}
                  sx={{ m: 0.5 }}
                  color="primary"
                  variant="outlined"
                />
              ))}
              {Object.keys(stats.treningi.dnaTechniki).length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  Brak danych
                </Typography>
              )}
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Cele Mentalne (TOP 5)
            </Typography>
            <Box>
              {getTopItems(stats.treningi.celeMentalne).map(([cel, count]) => (
                <Chip
                  key={cel}
                  label={`${cel} (${count})`}
                  sx={{ m: 0.5 }}
                  color="secondary"
                  variant="outlined"
                />
              ))}
              {Object.keys(stats.treningi.celeMentalne).length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  Brak danych
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Moduł 2: Statystyki Graczy */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <TrophyIcon /> Statystyki Graczy
        </Typography>

        {stats.gracze.length > 0 ? (
          <>
            {/* TOP 3 Gracze */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {stats.gracze.slice(0, 3).map((gracz, index) => (
                <Grid item xs={12} md={4} key={gracz.id}>
                  <Card
                    sx={{
                      bgcolor: index === 0 ? 'warning.light' : index === 1 ? 'grey.300' : 'error.light',
                      color: index === 0 ? 'warning.contrastText' : 'text.primary'
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h3" fontWeight="bold">
                          #{index + 1}
                        </Typography>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6">
                            {gracz.imie} {gracz.nazwisko}
                          </Typography>
                          <Typography variant="body2">
                            {gracz.sumaBramek} bramek • {gracz.sumaAsyst} asyst
                          </Typography>
                          <Typography variant="caption">
                            {gracz.punkty} punktów • {gracz.meczeRozegrane} meczów
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Tabela wszystkich graczy */}
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Zawodnik</TableCell>
                    <TableCell align="center">Mecze</TableCell>
                    <TableCell align="center">Minuty</TableCell>
                    <TableCell align="center">Śr. min</TableCell>
                    <TableCell align="center">Bramki</TableCell>
                    <TableCell align="center">Asysty</TableCell>
                    <TableCell align="center">Punkty</TableCell>
                    <TableCell align="center">Frekwencja</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.gracze.map((gracz, index) => (
                    <TableRow key={gracz.id} hover>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={index < 3 ? 'bold' : 'normal'}>
                          {gracz.imie} {gracz.nazwisko}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">{gracz.meczeRozegrane}</TableCell>
                      <TableCell align="center">{gracz.sumaMinut}'</TableCell>
                      <TableCell align="center">{gracz.sredniaMinut}'</TableCell>
                      <TableCell align="center">
                        <Chip label={gracz.sumaBramek} size="small" color="success" />
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={gracz.sumaAsyst} size="small" color="info" />
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={gracz.punkty} size="small" color="primary" />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={gracz.frekwencja}
                            sx={{ flex: 1, height: 6, borderRadius: 1 }}
                          />
                          <Typography variant="caption">{gracz.frekwencja}%</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        ) : (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
            Brak danych o graczach
          </Typography>
        )}
      </Paper>
    </Box>
  );
}

export default DashboardPage;
