import { useState, useEffect } from 'react';
import { loadAll, saveAll } from './utils';
import INITIAL_DATA from './data/index';
import PublicSite from './components/public/PublicSite';
import AdminLogin from './components/admin/AdminLogin';
import AdminPanel from './components/admin/AdminPanel';

export default function App() {
  const [data, setData] = useState(() => loadAll(INITIAL_DATA));
  const [mode, setMode] = useState('public');

  useEffect(() => {
    saveAll(data);
  }, [data]);

  const updateBeans = (next) => setData((d) => ({ ...d, beans: next }));
  const updateFarms = (next) => setData((d) => ({ ...d, farms: next }));
  const updateCountries = (next) => setData((d) => ({ ...d, countries: next }));
  const updateProcesses = (next) => setData((d) => ({ ...d, processes: next }));
  const updateTerms = (next) => setData((d) => ({ ...d, terms: next }));

  if (mode === 'login') {
    return <AdminLogin onLogin={() => setMode('admin')} onCancel={() => setMode('public')} />;
  }

  if (mode === 'admin') {
    return (
      <AdminPanel
        data={data}
        updateBeans={updateBeans}
        updateFarms={updateFarms}
        updateCountries={updateCountries}
        updateProcesses={updateProcesses}
        updateTerms={updateTerms}
        onLogout={() => setMode('public')}
      />
    );
  }

  return <PublicSite data={data} onOpenAdmin={() => setMode('login')} />;
}
