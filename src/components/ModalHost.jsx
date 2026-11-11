// Mostra a janela aberta em s.ui.modal ({name, props}). Clique fora ou Esc fecha.
import { useEffect, useRef } from 'react';
import { useApp, closeModal } from '../store/useApp';
import PedidoModal from '../modals/PedidoModal';
import PedidoManualModal from '../modals/PedidoManualModal';
import ClienteModal from '../modals/ClienteModal';
import ImportarModal from '../modals/ImportarModal';
import KitModal from '../modals/KitModal';
import CategoriaModal from '../modals/CategoriaModal';
import EditProdutoModal from '../modals/EditProdutoModal';
import ProdutoWizard from '../modals/ProdutoWizard';
import FidelidadeModal from '../modals/FidelidadeModal';

const MODALS = {
  pedido: PedidoModal, pedidoManual: PedidoManualModal, cliente: ClienteModal, importar: ImportarModal,
  kit: KitModal, categoria: CategoriaModal, editProd: EditProdutoModal, addProduto: ProdutoWizard, fidConfig: FidelidadeModal,
};

export default function ModalHost() {
  const modal = useApp((s) => s.ui.modal);
  const root = useRef(null);
  useEffect(() => {
    if (!modal) return;
    // foco no primeiro campo (ou botão) da janela
    const t = setTimeout(() => root.current?.querySelector('input:not([type=radio]):not([type=checkbox]):not([type=file]),select,button')?.focus(), 30);
    return () => clearTimeout(t);
  }, [modal?.key]);
  const C = modal && MODALS[modal.name];
  return (
    <div ref={root} className={`modal-root ${C ? 'on' : ''}`} role="dialog" aria-modal="true" onMouseDown={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
      {C && <C key={modal.key} {...modal.props} />}
    </div>
  );
}
