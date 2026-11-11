import { useEffect, useState } from 'react';

/** Rota atual pelo #endereço (ex.: #produtos). Mantém as mesmas URLs da versão em HTML. */
export function useRoute(valid, fallback) {
  const read = () => { const r = window.location.hash.slice(1); return valid.includes(r) ? r : fallback; };
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const on = () => setRoute(read());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}
