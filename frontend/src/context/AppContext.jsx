import { createContext, useContext, useState, useMemo } from 'react';
import { useDruzyny } from '../hooks/useDruzyny';

const AppContext = createContext(null);

/** Globalny stan współdzielony: lista drużyn + aktualnie wybrana drużyna. */
export function AppProvider({ children }) {
  const { druzyny, loading, error, reload } = useDruzyny();
  const [selectedDruzyna, setSelectedDruzyna] = useState('');

  const value = useMemo(
    () => ({ druzyny, loadingDruzyny: loading, errorDruzyny: error, reloadDruzyny: reload, selectedDruzyna, setSelectedDruzyna }),
    [druzyny, loading, error, reload, selectedDruzyna]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext musi być użyte wewnątrz <AppProvider>');
  }
  return ctx;
}

export default AppContext;
