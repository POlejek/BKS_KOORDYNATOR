import { useState, useEffect, useCallback } from 'react';
import { druzynyService } from '../services';

/**
 * Współdzielony hook do pobierania drużyn. Zastępuje powielony loadDruzyny()
 * rozsiany po wielu stronach.
 */
export function useDruzyny() {
  const [druzyny, setDruzyny] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await druzynyService.getAll();
      setDruzyny(res.data);
    } catch (err) {
      setError(err);
      console.error('Błąd ładowania drużyn:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { druzyny, loading, error, reload };
}

export default useDruzyny;
