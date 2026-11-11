// Estado central do painel (Zustand + Immer).
// Leitura em componentes:  const pedidos = useApp(s => s.pedidos)
// Alteração em qualquer lugar: mut(s => { s.ui.catSel = 'Bebidas' })  // pode "mutar" direto, o Immer cuida da cópia
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { buildInitialState } from '../data/seed';

export const useApp = create(immer(() => buildInitialState()));
export const mut = (fn) => useApp.setState(fn);
export const getState = () => useApp.getState();

/* ---- Toast (aviso rápido no canto da tela) ---- */
export const useToast = create(() => ({ msg: '', seq: 0 }));
export const toast = (msg) => { if (msg) useToast.setState((t) => ({ msg, seq: t.seq + 1 })); };

/* ---- Janelas (modais) ---- */
export const openModal = (name, props = {}) => mut((s) => { s.ui.modal = { name, props, key: Date.now() }; });
export const closeModal = () => mut((s) => { s.ui.modal = null; });
