import Icon from '../components/Icon';
import { Info, Stepper, Switch, PageHead, SecHead } from '../components/ui';
import { useApp, mut, toast } from '../store/useApp';

const IMPRESSORAS = ['Elgin i9 (USB)', 'Epson TM-T20X', 'Bematech MP-4200 TH', 'Daruma DR800'];

export default function Impressao() {
  const p = useApp((s) => s.print);
  const set = (patch) => mut((s) => { Object.assign(s.print, patch); });

  return (
    <>
      <PageHead icon="printer" variant="square" title="Impressão" sub="Configure a impressão automática dos pedidos" back={{ to: 'usuarios', label: 'Configurações' }} />
      <div className="qz-hero">
        <div className="laptop"><div className="screen"><Icon name="printer" className="qz-ico" /><b>QZ Tray</b></div><div className="base" /><span className="dl"><Icon name="download" /></span></div>
        <div className="qz-copy"><h2>1. Baixe e instale o QZ Tray</h2><p>O QZ Tray é um aplicativo que permite a impressão direta dos pedidos em impressoras térmicas, de forma automática.</p>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
            <a className="btn btn-primary" style={{ fontSize: 16, padding: '13px 24px' }} href="https://qz.io/download/" target="_blank" rel="noopener noreferrer"><Icon name="download" /> Baixar QZ Tray</a>
            <a className="link" style={{ color: 'var(--blue)', display: 'inline-flex', gap: 6, alignItems: 'center' }} href="https://qz.io/" target="_blank" rel="noopener noreferrer">Saiba mais <Icon name="external-link" /></a>
          </div></div>
        <div className="qz-after"><h3>Após a instalação:</h3><ol className="steps compact"><li><span>1</span>Selecione a impressora desejada</li><li><span>2</span>Ative a impressão automática</li></ol></div>
      </div>
      <div className="card card-pad"><div className="sec-h"><Icon name="printer" className="ico-or" /><div><h3 style={{ fontSize: 18 }}>Selecionar Impressora</h3><p style={{ fontSize: 14 }}>Escolha a impressora que será usada para imprimir os pedidos.</p></div></div>
        <div className="pr-row">
          <label className="inp grow" style={{ minHeight: 52 }}><Icon name="printer" />
            <select id="prSel" style={{ fontSize: 15 }} aria-label="Impressora" value={p.printer} onChange={(e) => { set({ printer: e.target.value }); if (e.target.value) toast(`Impressora selecionada: ${e.target.value}`); }}>
              <option value="">Selecione uma impressora</option>{IMPRESSORAS.map((o) => <option key={o}>{o}</option>)}
            </select></label>
          <Info style={{ flex: '0 1 380px' }}>Certifique-se de que o QZ Tray esteja em execução no seu computador.</Info>
        </div></div>
      <div className="card card-pad"><div className="sec-h"><Icon name="settings" className="ico-or" /><div><h3 style={{ fontSize: 18 }}>Opções de Impressão</h3></div></div>
        <div className="pr-opts">
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <Switch variant="big" style={{ margin: 0 }} checked={p.auto} onChange={(v) => { set({ auto: v }); toast(v ? 'Impressão automática ativada' : 'Impressão automática desativada'); }} label="Impressão automática" />
            <div><b className="t">Impressão Automática</b><p className="hint" style={{ margin: '4px 0 0', fontSize: 13 }}>Os pedidos serão impressos automaticamente após a confirmação.</p></div>
          </div>
          <div style={{ display: 'flex', gap: 16 }}><Icon name="scroll" className="big-ico" /><div className="form-stack" style={{ gap: 8 }}><b className="t">Tamanho do Papel</b>
            {['58', '80'].map((v) => <label key={v} className="radio"><input type="radio" name="prPaper" value={v} checked={p.paper === v} onChange={() => set({ paper: v })} /><span>Bobina de {v} mm</span></label>)}</div></div>
          <div style={{ display: 'flex', gap: 16 }}><Icon name="copy" className="big-ico" /><div className="form-stack" style={{ gap: 10 }}><b className="t">Quantidade de Vias</b>
            <Stepper big value={p.vias} min={1} max={5} label="vias" onChange={(n) => { set({ vias: n }); toast(`${n} via${n > 1 ? 's' : ''} por pedido`); }} /></div></div>
        </div></div>
      <div className="card card-pad pr-test">
        <div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}><span className="ico-c lg blue"><Icon name="check" /></span><div><h3 style={{ margin: 0, fontSize: 18, color: 'var(--ink)' }}>Teste de Impressão</h3><p className="hint" style={{ margin: '4px 0 16px', fontSize: 13 }}>Imprima um pedido de teste para verificar se tudo está funcionando corretamente.</p></div></div>
          <button className="btn btn-outline-or" onClick={() => { if (!p.printer) { toast('Selecione uma impressora antes de imprimir o teste'); document.getElementById('prSel').focus(); return; } toast(`Pedido de teste enviado para ${p.printer} (${p.paper} mm, ${p.vias} via${p.vias > 1 ? 's' : ''})`); }}><Icon name="printer" /> Imprimir Pedido de Teste</button>
        </div>
        <div className="qz-status"><span className="ico-c lg green"><Icon name="check" /></span><div><b>QZ Tray Conectado</b><p>O sistema está pronto para imprimir seus pedidos.</p></div><span className="pill p-green">Versão: 2.2.1</span></div>
      </div>
    </>
  );
}
