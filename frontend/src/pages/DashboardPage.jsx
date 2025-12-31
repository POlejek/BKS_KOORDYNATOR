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
import { Link, useNavigate } from 'react-router-dom';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { pl } from 'date-fns/locale';

function DashboardPage() {
  const [druzyny, setDruzyny] = useState([]);
  const [selectedDruzyna, setSelectedDruzyna] = useState('');
  const [selectedStartMonth, setSelectedStartMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedEndMonth, setSelectedEndMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [stats, setStats] = useState({
    treningi: {
      total: 0,
      mecze: 0,
      fazyGry: {},
      dnaTechniki: {},
      celeMentalne: {},
      celeMotoryczne: {}
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
  }, [selectedDruzyna, selectedStartMonth, selectedEndMonth]);

  const navigate = useNavigate();

  const generateMonthsOptions = (monthsRange = 24) => {
    const now = new Date();
    const options = [];
    for (let i = -monthsRange; i <= monthsRange; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      options.push(d);
    }
    return options;
  };

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
      const startDate = format(startOfMonth(selectedStartMonth), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(selectedEndMonth), 'yyyy-MM-dd');

      const [zawodnicyRes, kontroleRes, planyRes, obecnosciRes] = await Promise.all([
        zawodnicyService.getByDruzyna(selectedDruzyna),
        kontroleMeczoweService.getByDruzyna(selectedDruzyna),
        planySzkolenioweService.getByDruzyna(selectedDruzyna),
        obecnosciService.getByDruzyna(selectedDruzyna, { dataOd: startDate, dataDo: endDate }).catch(() => ({ data: [] }))
      ]);

      console.log('Dashboard - Pobrane dane:', {
        zawodnicy: zawodnicyRes.data.length,
        kontrole: kontroleRes.data.length,
        plany: planyRes.data.length,
        okres: `${startDate} - ${endDate}`
      });

      // Filtruj plany według wybranego miesiąca
      const planyWMiesiacu = planyRes.data.filter(plan => {
        const planDate = new Date(plan.dataTreningu);
        return planDate >= new Date(startDate) && planDate <= new Date(endDate);
      });

      console.log('Dashboard - Po filtrowaniu:', {
        planyWMiesiacu: planyWMiesiacu.length,
        wszystkiePlany: planyRes.data.map(p => ({ data: p.dataTreningu, typ: p.typWydarzenia }))
      });

      // Statystyki treningów
      const treningi = planyWMiesiacu.filter(p => p.typWydarzenia === 'trening');
      const mecze = planyWMiesiacu.filter(p => p.typWydarzenia === 'mecz');

      const fazyGry = {};
      const dnaTechniki = {};
      const celeMentalne = {};
      const celeMotoryczne = {};

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
        t.celMotoryczny?.forEach(c => {
          if (c) celeMotoryczne[c] = (celeMotoryczne[c] || 0) + 1;
        });
      });

      // Statystyki graczy
      const graczStats = zawodnicyRes.data.map(zawodnik => {
        const kontroleZawodnika = kontroleRes.data.flatMap(k => 
          (k.statystykiZawodnikow || []).filter(s => 
            (s.zawodnikId._id || s.zawodnikId) === zawodnik._id
          ).map(s => ({ ...s, dataMeczu: k.dataMeczu || k.data }))
        );

        const meczeRozegrane = kontroleZawodnika.filter(s => s.status === 'MP' || s.status === 'MR').length;
        const sumaBramek = kontroleZawodnika.reduce((sum, s) => sum + (s.ileBramek || 0), 0);
        const sumaAsyst = kontroleZawodnika.reduce((sum, s) => sum + (s.ileAsyst || 0), 0);
        const sumaMinut = kontroleZawodnika.reduce((sum, s) => sum + (s.ileMinut || 0), 0);
        const sredniaMinut = meczeRozegrane > 0 ? Math.round(sumaMinut / meczeRozegrane) : 0;

        // policz MP/MR/MN z kontroli meczowej
        const mpCount = kontroleZawodnika.filter(s => s.status === 'MP').length;
        const mrCount = kontroleZawodnika.filter(s => s.status === 'MR').length;
        const mnCount = kontroleZawodnika.filter(s => s.status === 'MN' || s.status === 'nieobecny').length;

        // Frekwencja - pobierz wszystkie obecności zawodnika
        const obecnosciZawodnika = (obecnosciRes.data || [])
          .filter(o => (o.zawodnik._id || o.zawodnik) === zawodnik._id);
        
        // Mapuj datę treningu na typ wydarzenia (trening/mecz) na podstawie planów
        const datyMeczy = planyRes.data
          .filter(p => p.typWydarzenia === 'mecz')
          .map(p => format(new Date(p.dataTreningu), 'yyyy-MM-dd'));

        // Rozdziel obecności na treningi i mecze (uwzględnij brak wpisu jako nieobecny - MN)
        const obecnosciNaTreningach = [];

        // Map obecnosci treningowe (nie meczowe)
        const obecnosciByDate = {};
        obecnosciZawodnika.forEach(o => {
          const dataStr = format(new Date(o.dataTreningu), 'yyyy-MM-dd');
          if (!obecnosciByDate[dataStr]) obecnosciByDate[dataStr] = [];
          obecnosciByDate[dataStr].push(o.status);
          const isMatch = datyMeczy.includes(dataStr);
          if (!isMatch) obecnosciNaTreningach.push(o);
        });

        // Dla meczów korzystamy wyłącznie z Kontrola Meczowa
        const obecnosciNaMeczach = datyMeczy.map(dateStr => {
          const statuses = [];
          kontroleRes.data.forEach(k => {
            const kDate = format(new Date(k.dataMeczu || k.data), 'yyyy-MM-dd');
            if (kDate === dateStr) {
              (k.statystykiZawodnikow || []).forEach(s => {
                const sid = (s.zawodnikId && (s.zawodnikId._id || s.zawodnikId));
                if (sid === zawodnik._id && s.status) statuses.push(s.status);
              });
            }
          });
          return { date: dateStr, statuses };
        });
        
        const frekwencjaTreningi = obecnosciNaTreningach.length > 0
          ? Math.round((obecnosciNaTreningach.filter(o => o.status === 'obecny').length / obecnosciNaTreningach.length) * 100)
          : 0;

        // Dla meczów: frekwencję liczmy na podstawie kontroli meczowej
        const obecnosciMeczeObecne = obecnosciNaMeczach.map(m => m.statuses.some(s => s === 'MP' || s === 'MR'));
        const liczbaMeczy = datyMeczy.length;
        const frekwencjaMecze = liczbaMeczy > 0
          ? Math.round((obecnosciMeczeObecne.filter(Boolean).length / liczbaMeczy) * 100)
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
          frekwencjaTreningi,
          frekwencjaMecze,
          obecnosciTreningiLiczba: obecnosciNaTreningach.filter(o => o.status === 'obecny').length,
          obecnosciTreningiMax: obecnosciNaTreningach.length,
          obecnosciMeczeLiczba: obecnosciNaMeczach.reduce((sum, m) => sum + (m.statuses.some(s => s === 'MP' || s === 'MR') ? 1 : 0), 0),
          obecnosciMeczeMax: obecnosciNaMeczach.length,
          mpCount,
          mrCount,
          mnCount,
          punkty: sumaBramek + sumaAsyst // Punkty: bramki + asysty
        };
      });

      // Sortuj graczy według punktów
      graczStats.sort((a, b) => b.punkty - a.punkty);

      // TOP3 obecności na treningach
      const topTreningi = [...graczStats]
        .sort((a, b) => b.obecnosciTreningiLiczba - a.obecnosciTreningiLiczba)
        .slice(0, 3)
        .map(g => ({ id: g.id, imie: g.imie, nazwisko: g.nazwisko, ilosc: g.obecnosciTreningiLiczba }));

      const topMinuty = [...graczStats]
        .sort((a, b) => b.sumaMinut - a.sumaMinut)
        .slice(0, 3)
        .map(g => ({ id: g.id, imie: g.imie, nazwisko: g.nazwisko, minuty: g.sumaMinut, mp: g.mpCount || 0, mr: g.mrCount || 0, mn: g.mnCount || 0 }));

      setStats({
        treningi: {
          total: treningi.length,
          mecze: mecze.length,
          fazyGry,
          dnaTechniki,
          celeMentalne,
          celeMotoryczne
        },
        gracze: graczStats,
        topTreningi,
        topMinuty
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
            <InputLabel>Start miesiąc</InputLabel>
            <Select
              value={format(selectedStartMonth, 'yyyy-MM')}
              onChange={(e) => setSelectedStartMonth(new Date(e.target.value + '-01'))}
              label="Start miesiąc"
            >
              {generateMonthsOptions(24).map((date, idx) => (
                <MenuItem key={idx} value={format(date, 'yyyy-MM')}>
                  {format(date, 'LLLL yyyy', { locale: pl })}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>End miesiąc</InputLabel>
            <Select
              value={format(selectedEndMonth, 'yyyy-MM')}
              onChange={(e) => setSelectedEndMonth(new Date(e.target.value + '-01'))}
              label="End miesiąc"
            >
              {generateMonthsOptions(24).map((date, idx) => (
                <MenuItem key={idx} value={format(date, 'yyyy-MM')}>
                  {format(date, 'LLLL yyyy', { locale: pl })}
                </MenuItem>
              ))}
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
          <Grid item xs={12} md={3}>
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
                    value={stats.treningi.total ? (count / stats.treningi.total) * 100 : 0}
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

          <Grid item xs={12} md={3}>
            <Typography variant="h6" gutterBottom>
              DNA Techniki
            </Typography>
            <Box>
              {getTopItems(stats.treningi.dnaTechniki).map(([tech, count]) => (
                <Box key={tech} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">{tech}</Typography>
                    <Typography variant="body2" fontWeight="bold">{count}x</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={stats.treningi.total ? (count / stats.treningi.total) * 100 : 0}
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>
              ))}
              {Object.keys(stats.treningi.dnaTechniki).length === 0 && (
                <Typography variant="body2" color="text.secondary">Brak danych</Typography>
              )}
            </Box>
          </Grid>

          <Grid item xs={12} md={3}>
            <Typography variant="h6" gutterBottom>
              Cele Mentalne
            </Typography>
            <Box>
              {getTopItems(stats.treningi.celeMentalne).map(([cel, count]) => (
                <Box key={cel} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">{cel}</Typography>
                    <Typography variant="body2" fontWeight="bold">{count}x</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={stats.treningi.total ? (count / stats.treningi.total) * 100 : 0}
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>
              ))}
              {Object.keys(stats.treningi.celeMentalne).length === 0 && (
                <Typography variant="body2" color="text.secondary">Brak danych</Typography>
              )}
            </Box>
          </Grid>

          <Grid item xs={12} md={3}>
            <Typography variant="h6" gutterBottom>
              Cele Motoryczne
            </Typography>
            <Box>
              {getTopItems(stats.treningi.celeMotoryczne).map(([cel, count]) => (
                <Box key={cel} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">{cel}</Typography>
                    <Typography variant="body2" fontWeight="bold">{count}x</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={stats.treningi.total ? (count / stats.treningi.total) * 100 : 0}
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>
              ))}
              {Object.keys(stats.treningi.celeMotoryczne).length === 0 && (
                <Typography variant="body2" color="text.secondary">Brak danych</Typography>
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
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <Typography variant="h6">Skuteczność</Typography>
                <Box sx={{ mt: 1 }}>
                      {(stats.gracze || []).slice(0, 5).map((g, i) => (
                        <Card
                          key={g.id}
                          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, mb: 1, cursor: 'pointer', bgcolor: i === 0 ? 'warning.light' : 'background.paper' }}
                          onClick={() => navigate(`/zawodnicy/${g.id}`)}
                        >
                          <Box>
                            <Typography variant="body1" sx={{ textDecoration: 'none' }}>{g.imie} {g.nazwisko}</Typography>
                            <Typography variant="caption" color="text.secondary">{g.sumaBramek} br. • {g.sumaAsyst} ast</Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="h6" fontWeight="bold">{g.punkty}</Typography>
                          </Box>
                        </Card>
                      ))}
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="h6">Frekwencja (treningi) - TOP 3</Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                  {(stats.topTreningi || []).map((t, i) => (
                    <Card key={t.id} sx={{ flex: 1, bgcolor: i === 0 ? 'warning.light' : i === 1 ? 'grey.300' : 'info.light', color: i === 0 ? 'warning.contrastText' : 'text.primary' }}>
                      <CardContent>
                        <Typography variant="h6">#{i + 1} <Link to={`/zawodnicy/${t.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>{t.imie} {t.nazwisko}</Link></Typography>
                        <Typography variant="body2">{t.ilosc} treningów</Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="h6">Frekwencja meczowa - TOP 3 (minuty)</Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                  {(stats.topMinuty || []).map((t, i) => (
                    <Card key={t.id} sx={{ flex: 1, bgcolor: i === 0 ? 'warning.light' : i === 1 ? 'grey.300' : 'info.light', color: i === 0 ? 'warning.contrastText' : 'text.primary' }}>
                      <CardContent>
                        <Typography variant="h6">#{i + 1} <Link to={`/zawodnicy/${t.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>{t.imie} {t.nazwisko}</Link></Typography>
                        <Typography variant="body2">{t.minuty} minut</Typography>
                        <Typography variant="caption">MP: {t.mp} • MR: {t.mr} • MN: {t.mn}</Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Grid>
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
                    <TableCell align="center">Obecność treningi</TableCell>
                    <TableCell align="center">Obecność mecze</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.gracze.map((gracz, index) => (
                    <TableRow key={gracz.id} hover onClick={() => navigate(`/zawodnicy/${gracz.id}`)} sx={{ cursor: 'pointer' }}>
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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                          <LinearProgress
                            variant="determinate"
                            value={gracz.frekwencjaTreningi}
                            sx={{ flex: 1, minWidth: 60, height: 6, borderRadius: 1 }}
                            color={gracz.frekwencjaTreningi >= 80 ? 'success' : gracz.frekwencjaTreningi >= 60 ? 'warning' : 'error'}
                          />
                          <Typography variant="caption" sx={{ minWidth: 65 }}>
                            {gracz.frekwencjaTreningi}% ({gracz.obecnosciTreningiLiczba}/{gracz.obecnosciTreningiMax})
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                          <LinearProgress
                            variant="determinate"
                            value={gracz.frekwencjaMecze}
                            sx={{ flex: 1, minWidth: 60, height: 6, borderRadius: 1 }}
                            color={gracz.frekwencjaMecze >= 80 ? 'success' : gracz.frekwencjaMecze >= 60 ? 'warning' : 'error'}
                          />
                          <Typography variant="caption" sx={{ minWidth: 65 }}>
                            {gracz.frekwencjaMecze}% ({gracz.obecnosciMeczeLiczba}/{gracz.obecnosciMeczeMax})
                          </Typography>
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
