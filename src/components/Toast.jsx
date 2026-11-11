import { useEffect, useState } from 'react';
import Icon from './Icon';
import { useToast } from '../store/useApp';

export default function Toast() {
  const { msg, seq } = useToast();
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!seq) return;
    setOn(true);
    const t = setTimeout(() => setOn(false), 2600);
    return () => clearTimeout(t);
  }, [seq]);
  return (
    <div className={`toast ${on ? 'on' : ''}`} role="status" aria-live="polite">
      <Icon name="check-circle-2" /><span id="toastMsg">{msg}</span>
    </div>
  );
}
