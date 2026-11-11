import { useRef, useState } from 'react';

/**
 * Arrastar linhas de uma tabela para reordenar.
 * Devolve uma função que gera as props de cada linha: rowProps(posição).
 */
export function useRowDrag(enabled, onMove) {
  const from = useRef(null);
  const [drag, setDrag] = useState(null), [over, setOver] = useState(null);
  return (pos) => {
    if (!enabled) return {};
    return {
      draggable: true,
      className: `${drag === pos ? 'dragging' : ''} ${over === pos ? 'drop-target' : ''}`.trim() || undefined,
      onDragStart: (e) => { from.current = pos; setDrag(pos); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(pos)); },
      onDragEnd: () => { setDrag(null); setOver(null); },
      onDragOver: (e) => { e.preventDefault(); if (over !== pos) setOver(pos); },
      onDragLeave: () => setOver((o) => (o === pos ? null : o)),
      onDrop: (e) => { e.preventDefault(); setOver(null); setDrag(null); if (from.current !== null) onMove(from.current, pos); from.current = null; },
    };
  };
}
