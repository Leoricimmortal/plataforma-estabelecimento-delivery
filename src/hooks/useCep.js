import { useRef, useState } from 'react';
import { buscarCep, cepMensagem } from '../lib/cep';

/**
 * Busca o CEP e devolve a mensagem de ajuda.
 * aplicar(r) recebe {rua, bairro, cidade, uf, completo} para preencher o formulário.
 */
export function useCep(setorLbl, aplicar, focoRua, focoNro) {
  const [hint, setHint] = useState({ tipo: '', texto: '' });
  const ultima = useRef('');
  const buscar = async (cep) => {
    ultima.current = cep;
    setHint({ tipo: '', texto: 'Buscando endereço...' });
    const r = await buscarCep(cep);
    if (ultima.current !== cep) return; // o usuário já digitou outro CEP
    setHint(cepMensagem(r, setorLbl));
    if (r.erro) return;
    aplicar(r);
    setTimeout(() => document.getElementById(r.completo && r.rua && focoNro ? focoNro : focoRua)?.focus(), 0);
  };
  return { hint, buscar };
}
