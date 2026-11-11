// Lista de produtos com busca, caixa de seleção e quantidade (usada no Kit e no Pedido manual).
import { useState } from 'react';
import Icon from './Icon';
import { Thumb } from './ui';
import { brl } from '../lib/format';

/** value = { [nome]: { on:boolean, q:number } } */
export const pickedList = (value, items) => items.filter((it) => value[it.nome]?.on).map((it) => [it.nome, value[it.nome].q || 1, it.preco]);

export default function ProdPicker({ items, value, onChange, id }) {
  const [q, setQ] = useState('');
  const set = (nome, patch) => onChange({ ...value, [nome]: { on: false, q: 1, ...value[nome], ...patch } });
  const busca = q.toLowerCase();
  return (
    <>
      <label className="inp"><Icon name="search" /><input id={`${id}Q`} placeholder="Buscar produtos..." aria-label="Buscar produtos" value={q} onChange={(e) => setQ(e.target.value)} /></label>
      <div className="pay-list pick-list" id={id}>
        {items.map((p) => {
          const v = value[p.nome] || { on: false, q: 1 };
          return (
            <div key={p.key || p.nome} className="pay-row" hidden={!!busca && !p.nome.toLowerCase().includes(busca)}>
              <input type="checkbox" className="pick-item" checked={v.on} onChange={(e) => set(p.nome, { on: e.target.checked })} style={{ accentColor: 'var(--orange)', width: 16, height: 16 }} aria-label={p.nome} />
              <Thumb item={p} className="sm" />
              <div style={{ flex: 1, minWidth: 0 }}><b>{p.nome}</b><small>{p.sub} · {brl(p.preco)}</small></div>
              <div className="stepper">
                <button type="button" onClick={() => set(p.nome, { q: Math.max(1, v.q - 1), on: true })} aria-label="Menos">−</button>
                <span>{v.q}</span>
                <button type="button" onClick={() => set(p.nome, { q: v.q + 1, on: true })} aria-label="Mais">+</button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
