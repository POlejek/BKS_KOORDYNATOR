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
  TextField,
  Chip,
  Autocomplete,
  Grid,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { druzynyService, planySzkolenioweService, ustawieniaService, kontroleMeczoweService } from '../services';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth, getWeek, isSameDay, addDays } from 'date-fns';
import { pl } from 'date-fns/locale';

const fazyGry = [
  'Finalizacja+Obrona Niska',
  'Budowanie Gry + Obrona Średnia',
  'Otwarcie gry + Obrona wysoka',
  'Transfer Atak/Obrona',
  'Transfer Obrona/Atak'
];

function PlanSzkoleniowy() {
  const [druzyny, setDruzyny] = useState([]);
  const [selectedDruzyna, setSelectedDruzyna] = useState('');
  const [plany, setPlany] = useState([]);
  const [ustawienia, setUstawienia] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [formData, setFormData] = useState({
    dataTreningu: format(new Date(), 'yyyy-MM-dd'),
    typWydarzenia: 'trening',
    dominujacaFazaGry: '',
    dnaTechniki: [],
    celMotoryczny: [],
    celMentalny: [],
    cwiczenia: ['', '', '', '', ''],
    opisCelow: '',
    wybrane_zasady: '',
    zalozenia: '',
    numerTreningWTygodniu: 1
  });

  useEffect(() => {
    loadDruzyny();
    loadUstawienia();
  }, []);

  useEffect(() => {
    if (selectedDruzyna) {
      loadPlany();
    }
  }, [selectedDruzyna]);

  const loadDruzyny = async () => {
    try {
      const response = await druzynyService.getAll();
      setDruzyny(response.data);
    } catch (error) {
      console.error('Błąd ładowania drużyn:', error);
    }
  };

  const loadUstawienia = async () => {
    try {
      const response = await ustawieniaService.get();
      setUstawienia(response.data);
    } catch (error) {
      console.error('Błąd ładowania ustawień:', error);
    }
  };

  const loadPlany = async () => {
    try {
      const response = await planySzkolenioweService.getByDruzyna(selectedDruzyna);
      setPlany(response.data);
    } catch (error) {
      console.error('Błąd ładowania planów:', error);
    }
  };

  const getNumerTreningWTygodniu = (data) => {
    const weekStart = startOfWeek(new Date(data), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(data), { weekStartsOn: 1 });
    
    // Znajdź wszystkie treningi w tym tygodniu (nie mecze)
    const treningiWTygodniu = plany
      .filter(p => {
        const planData = new Date(p.dataTreningu);
        return p.typWydarzenia === 'trening' && 
               planData >= weekStart && 
               planData <= weekEnd &&
               planData < new Date(data); // tylko treningi przed tą datą
      })
      .sort((a, b) => new Date(a.dataTreningu) - new Date(b.dataTreningu));
    
    return treningiWTygodniu.length + 1;
  };

  const handleOpenDialog = (plan = null) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        dataTreningu: plan.dataTreningu ? format(new Date(plan.dataTreningu), 'yyyy-MM-dd') : '',
        typWydarzenia: plan.typWydarzenia || 'trening',
        dominujacaFazaGry: plan.dominujacaFazaGry,
        dnaTechniki: plan.dnaTechniki || [],
        celMotoryczny: plan.celMotoryczny || [],
        celMentalny: plan.celMentalny || [],
        cwiczenia: plan.cwiczenia && plan.cwiczenia.length === 5 ? plan.cwiczenia : ['', '', '', '', ''],
        opisCelow: plan.opisCelow || '',
        wybrane_zasady: plan.wybrane_zasady || '',
        zalozenia: plan.zalozenia || '',
        numerTreningWTygodniu: plan.numerTreningWTygodniu || 1
      });
    } else {
      const dzisiaj = format(new Date(), 'yyyy-MM-dd');
      const numerTreningu = getNumerTreningWTygodniu(dzisiaj);
      
      setEditingPlan(null);
      setFormData({
        dataTreningu: dzisiaj,
        typWydarzenia: 'trening',
        dominujacaFazaGry: '',
        dnaTechniki: [],
        celMotoryczny: [],
        celMentalny: [],
        cwiczenia: ['', '', '', '', ''],
        opisCelow: '',
        wybrane_zasady: '',
        zalozenia: '',
        numerTreningWTygodniu: numerTreningu
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPlan(null);
  };

  const handleSave = async () => {
    try {
      const data = {
        ...formData,
        druzyna: selectedDruzyna
      };

      if (editingPlan) {
        await planySzkolenioweService.update(editingPlan._id, data);
      } else {
        await planySzkolenioweService.create(data);
      }
      handleCloseDialog();
      loadPlany();
    } catch (error) {
      console.error('Błąd zapisywania planu:', error);
    }
  };

  const handleDelete = async (planId) => {
    if (window.confirm('Czy na pewno chcesz usunąć ten plan?')) {
      try {
        const plan = plany.find(p => p._id === planId);
        
        // Usuń plan szkoleniowy
        await planySzkolenioweService.delete(planId);
        
        // Synchronizacja: Jeśli to był mecz, usuń również kontrolę meczową
        if (plan && plan.typWydarzenia === 'mecz') {
          try {
            const kontroleRes = await kontroleMeczoweService.getAll(selectedDruzyna);
            const kontrolaMeczu = kontroleRes.data.find(k => 
              format(new Date(k.dataMeczu), 'yyyy-MM-dd') === format(new Date(plan.dataTreningu), 'yyyy-MM-dd')
            );
            
            if (kontrolaMeczu) {
              await kontroleMeczoweService.delete(kontrolaMeczu._id);
            }
          } catch (err) {
            console.error('Błąd usuwania kontroli meczowej:', err);
          }
        }
        
        loadPlany();
      } catch (error) {
        console.error('Błąd usuwania planu:', error);
      }
    }
  };

  const getZalozeniaForTrening = (numerTreningu) => {
    if (!ustawienia?.zalozeniaTreningow) return '';
    return ustawienia.zalozeniaTreningow[`trening${numerTreningu}`] || '';
  };

  useEffect(() => {
    if (formData.typWydarzenia === 'trening' && formData.numerTreningWTygodniu && ustawienia?.zalozeniaTreningow) {
      const zalozenia = getZalozeniaForTrening(formData.numerTreningWTygodniu);
      setFormData(prev => ({
        ...prev,
        zalozenia: zalozenia
      }));
    } else if (formData.typWydarzenia === 'mecz') {
      setFormData(prev => ({
        ...prev,
        zalozenia: ''
      }));
    }
  }, [formData.numerTreningWTygodniu, formData.typWydarzenia, ustawienia]);

  // Aktualizuj numer treningu przy zmianie daty (tylko dla nowych planów, nie dla edycji)
  useEffect(() => {
    if (!editingPlan && formData.dataTreningu && formData.typWydarzenia === 'trening') {
      const nowyNumer = getNumerTreningWTygodniu(formData.dataTreningu);
      if (nowyNumer !== formData.numerTreningWTygodniu) {
        setFormData(prev => ({
          ...prev,
          numerTreningWTygodniu: nowyNumer
        }));
      }
    }
  }, [formData.dataTreningu, formData.typWydarzenia, editingPlan, plany]);

  // Funkcje do obsługi kalendarza tygodniowego
  const getWeeksInMonth = (date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const weeks = [];
    let currentWeekStart = startOfWeek(start, { weekStartsOn: 1 }); // Poniedziałek

    while (currentWeekStart <= end) {
      const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
      weeks.push({
        weekNumber: getWeek(currentWeekStart, { weekStartsOn: 1, firstWeekContainsDate: 4 }),
        start: currentWeekStart,
        end: weekEnd,
        days: eachDayOfInterval({ start: currentWeekStart, end: weekEnd })
      });
      currentWeekStart = addDays(weekEnd, 1);
    }
    return weeks;
  };

  const getPlanForDay = (date) => {
    return plany.find(plan => 
      isSameDay(new Date(plan.dataTreningu), date)
    );
  };

  const weeks = getWeeksInMonth(selectedMonth);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Plan Szkoleniowy</Typography>
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
          {selectedDruzyna && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Dodaj Trening/Mecz
            </Button>
          )}
        </Box>
      </Box>

      {selectedDruzyna && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 180, bgcolor: 'grey.200', fontWeight: 'bold' }}>
                  Kategoria
                </TableCell>
                {['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'].map((day, idx) => (
                  <TableCell key={day} align="center" sx={{ minWidth: 150, bgcolor: 'primary.light', color: 'white' }}>
                    {day}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {weeks.map((week, weekIdx) => {
                const kategorieWiersze = [
                  { label: 'Data / Typ', field: 'data', color: 'grey.100' },
                  { label: 'Dominująca Faza Gry', field: 'dominujacaFazaGry', color: 'blue.50' },
                  { label: 'DNA Techniki', field: 'dnaTechniki', color: 'green.50' },
                  { label: 'Cel Motoryczny', field: 'celMotoryczny', color: 'orange.50' },
                  { label: 'Cel Mentalny', field: 'celMentalny', color: 'purple.50' },
                  { label: 'Opis Celów + Zasady', field: 'opisCelow', color: 'cyan.50' },
                  { label: 'Założenia', field: 'zalozenia', color: 'pink.50' },
                  { label: 'Ćwiczenie 1', field: 'cwiczenie1', color: 'yellow.50' },
                  { label: 'Ćwiczenie 2', field: 'cwiczenie2', color: 'yellow.50' },
                  { label: 'Ćwiczenie 3', field: 'cwiczenie3', color: 'yellow.50' },
                  { label: 'Ćwiczenie 4', field: 'cwiczenie4', color: 'yellow.50' },
                  { label: 'Ćwiczenie 5', field: 'cwiczenie5', color: 'yellow.50' },
                ];

                return (
                  <React.Fragment key={weekIdx}>
                    {/* Nagłówek tygodnia */}
                    <TableRow>
                      <TableCell colSpan={8} sx={{ bgcolor: 'grey.300', fontWeight: 'bold', py: 1 }}>
                        Tydzień {week.weekNumber} ({format(week.start, 'dd.MM', { locale: pl })} - {format(week.end, 'dd.MM', { locale: pl })})
                      </TableCell>
                    </TableRow>
                    
                    {kategorieWiersze.map((kategoria, katIdx) => (
                      <TableRow key={`${weekIdx}-${katIdx}`}>
                        <TableCell sx={{ bgcolor: kategoria.color, fontWeight: 'bold', fontSize: '0.85rem' }}>
                          {kategoria.label}
                        </TableCell>
                        {week.days.map((day, dayIdx) => {
                          const plan = getPlanForDay(day);
                          const isCurrentMonth = day.getMonth() === selectedMonth.getMonth();
                          
                          let content = '';
                          
                          if (plan) {
                            if (kategoria.field === 'data') {
                              content = (
                                <Box>
                                  <Typography variant="caption" fontWeight="bold">
                                    {format(day, 'd MMM', { locale: pl })}
                                  </Typography>
                                  <Chip 
                                    label={plan.typWydarzenia === 'mecz' ? 'MECZ' : `T${plan.numerTreningWTygodniu}`}
                                    size="small"
                                    color={plan.typWydarzenia === 'mecz' ? 'secondary' : 'primary'}
                                    sx={{ fontSize: '0.7rem', mt: 0.5, width: '100%' }}
                                  />
                                  <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, justifyContent: 'center' }}>
                                    <IconButton 
                                      size="small" 
                                      onClick={() => handleOpenDialog(plan)}
                                      sx={{ p: 0.25 }}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton 
                                      size="small" 
                                      color="error"
                                      onClick={() => handleDelete(plan._id)}
                                      sx={{ p: 0.25 }}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Box>
                                </Box>
                              );
                            } else if (kategoria.field === 'dominujacaFazaGry') {
                              content = plan.dominujacaFazaGry || '';
                            } else if (kategoria.field === 'dnaTechniki') {
                              content = plan.dnaTechniki && plan.dnaTechniki.length > 0 ? (
                                <Box sx={{ display: 'flex', gap: 0.3, flexWrap: 'wrap' }}>
                                  {plan.dnaTechniki.map((tech, idx) => (
                                    <Chip key={idx} label={tech} size="small" sx={{ fontSize: '0.65rem', height: 18 }} />
                                  ))}
                                </Box>
                              ) : '';
                            } else if (kategoria.field === 'celMotoryczny') {
                              content = plan.celMotoryczny && plan.celMotoryczny.length > 0 ? plan.celMotoryczny.join(', ') : '';
                            } else if (kategoria.field === 'celMentalny') {
                              content = plan.celMentalny && plan.celMentalny.length > 0 ? plan.celMentalny.join(', ') : '';
                            } else if (kategoria.field === 'opisCelow') {
                              content = plan.opisCelow || '';
                            } else if (kategoria.field === 'zalozenia') {
                              content = plan.zalozenia || '';
                            } else if (kategoria.field.startsWith('cwiczenie')) {
                              const idx = parseInt(kategoria.field.replace('cwiczenie', '')) - 1;
                              content = plan.cwiczenia && plan.cwiczenia[idx] ? plan.cwiczenia[idx] : '';
                            }
                          } else if (kategoria.field === 'data') {
                            content = (
                              <Typography variant="caption" color="text.disabled">
                                {format(day, 'd MMM', { locale: pl })}
                              </Typography>
                            );
                          }
                          
                          return (
                            <TableCell 
                              key={dayIdx}
                              sx={{ 
                                bgcolor: !isCurrentMonth ? 'grey.100' : (plan ? 'white' : 'grey.50'),
                                verticalAlign: 'top',
                                p: 1,
                                fontSize: '0.8rem',
                                border: '1px solid',
                                borderColor: 'grey.300'
                              }}
                            >
                              {content}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPlan ? 'Edytuj plan szkoleniowy' : 'Dodaj Trening/Mecz'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField
                  label="Data wydarzenia"
                  type="date"
                  value={formData.dataTreningu}
                  onChange={(e) => setFormData({ ...formData, dataTreningu: e.target.value })}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth required>
                  <InputLabel>Typ wydarzenia</InputLabel>
                  <Select
                    value={formData.typWydarzenia}
                    onChange={(e) => setFormData({ ...formData, typWydarzenia: e.target.value })}
                    label="Typ wydarzenia"
                  >
                    <MenuItem value="trening">Trening</MenuItem>
                    <MenuItem value="mecz">Mecz</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Numer treningu w tygodniu"
                  value={formData.typWydarzenia === 'mecz' ? 'Mecz' : `Trening ${formData.numerTreningWTygodniu}`}
                  fullWidth
                  disabled
                  helperText="Ustawiany automatycznie na podstawie daty"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <FormControl fullWidth required>
              <InputLabel>Dominująca faza gry</InputLabel>
              <Select
                value={formData.dominujacaFazaGry}
                onChange={(e) => setFormData({ ...formData, dominujacaFazaGry: e.target.value })}
                label="Dominująca faza gry"
              >
                {fazyGry.map((faza) => (
                  <MenuItem key={faza} value={faza}>
                    {faza}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Autocomplete
              multiple
              options={ustawienia?.dnaTechniki?.filter(d => d.aktywne).map(d => d.nazwa) || []}
              value={formData.dnaTechniki}
              onChange={(e, newValue) => setFormData({ ...formData, dnaTechniki: newValue.slice(0, 6) })}
              renderInput={(params) => (
                <TextField {...params} label="DNA Techniki (max 6)" />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip label={option} {...getTagProps({ index })} />
                ))
              }
            />

            <Autocomplete
              multiple
              options={ustawienia?.celeMotoryczne?.filter(c => c.aktywne).map(c => c.nazwa) || []}
              value={formData.celMotoryczny}
              onChange={(e, newValue) => setFormData({ ...formData, celMotoryczny: newValue })}
              renderInput={(params) => (
                <TextField {...params} label="CEL Motoryczny" />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip label={option} {...getTagProps({ index })} />
                ))
              }
            />

            <Autocomplete
              multiple
              options={ustawienia?.celeMentalne?.filter(c => c.aktywne).map(c => c.nazwa) || []}
              value={formData.celMentalny}
              onChange={(e, newValue) => setFormData({ ...formData, celMentalny: newValue })}
              renderInput={(params) => (
                <TextField {...params} label="CEL Mentalny" />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip label={option} {...getTagProps({ index })} />
                ))
              }
            />

            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
              Ćwiczenia (maksymalnie 5)
            </Typography>
            {[0, 1, 2, 3, 4].map((index) => (
              <TextField
                key={index}
                label={`Ćwiczenie ${index + 1}`}
                value={formData.cwiczenia[index] || ''}
                onChange={(e) => {
                  const newCwiczenia = [...formData.cwiczenia];
                  newCwiczenia[index] = e.target.value;
                  setFormData({ ...formData, cwiczenia: newCwiczenia });
                }}
                fullWidth
                placeholder={`Opisz ${index + 1}. ćwiczenie...`}
              />
            ))}

            <TextField
              label="Opis Celów + wybrane zasady"
              value={formData.opisCelow}
              onChange={(e) => setFormData({ ...formData, opisCelow: e.target.value })}
              fullWidth
              multiline
              rows={3}
              placeholder="Wpisz cele i zasady treningu..."
            />

            <TextField
              label="Założenia"
              value={formData.zalozenia}
              onChange={(e) => setFormData({ ...formData, zalozenia: e.target.value })}
              fullWidth
              multiline
              rows={3}
              helperText="Założenia są automatycznie wczytywane na podstawie numeru treningu w tygodniu"
            />
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

export default PlanSzkoleniowy;
