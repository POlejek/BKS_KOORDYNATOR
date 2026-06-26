import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, Chip, Stack, Alert } from '@mui/material';
import { Link } from 'react-router-dom';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { zawodnicyService } from '../services';
import { formatData } from '../utils/dateFormat';

/**
 * Kafelek dashboardu: zawodnicy z wygasającymi lub nieaktualnymi badaniami / DGA.
 * Czysty odczyt z endpointu /zawodnicy/alerty/badania.
 */
function AlertyBadan({ dni = 30 }) {
  const [alerty, setAlerty] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let aktywne = true;
    zawodnicyService
      .getWygasajaceBadania(dni)
      .then((res) => {
        if (aktywne) setAlerty(res.data);
      })
      .catch((err) => console.error('Błąd ładowania alertów badań:', err))
      .finally(() => {
        if (aktywne) setLoading(false);
      });
    return () => {
      aktywne = false;
    };
  }, [dni]);

  return (
    <Card sx={{ mb: 3, borderLeft: '4px solid', borderColor: 'warning.main' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <WarningAmberIcon color="warning" />
          <Typography variant="h6">Badania / DGA – wymagają uwagi (≤ {dni} dni)</Typography>
        </Box>

        {loading && <Typography color="text.secondary">Ładowanie…</Typography>}

        {!loading && alerty.length === 0 && (
          <Alert severity="success" variant="outlined">
            Wszyscy zawodnicy mają aktualne badania i DGA.
          </Alert>
        )}

        {!loading && alerty.length > 0 && (
          <Stack spacing={1}>
            {alerty.map((z) => (
              <Box
                key={z._id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1,
                  p: 1,
                  borderRadius: 1,
                  bgcolor: 'grey.50',
                }}
              >
                <Typography
                  component={Link}
                  to={`/zawodnicy/${z._id}`}
                  sx={{ textDecoration: 'none', color: 'text.primary', fontWeight: 500 }}
                >
                  {z.imie} {z.nazwisko}
                  {z.druzyna?.nazwa ? ` · ${z.druzyna.nazwa}` : ''}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    size="small"
                    label={`Badania: ${formatData(z.okresWaznosciBadan)}`}
                    color={z.badaniaPoTerminie ? 'error' : 'warning'}
                  />
                  {z.dgaWazneDo && (
                    <Chip
                      size="small"
                      label={`DGA: ${formatData(z.dgaWazneDo)}`}
                      color={z.dgaPoTerminie ? 'error' : 'warning'}
                      variant="outlined"
                    />
                  )}
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

export default AlertyBadan;
