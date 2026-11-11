import Icon from '../components/Icon';
import { PageHead, SecHead, Info, Toggle, FreeText } from '../components/ui';
import { toast } from '../store/useApp';
import { navigate } from '../store/actions';

const PRES = [['shield', 'Na retirada (presencial)', 'Pagamento em dinheiro, cartão ou outro método na entrega.'], ['diamond', 'Pix', 'Pagamento instantâneo, rápido e seguro.'], ['credit-card', 'Cartão de crédito', 'Débito e crédito (Visa, Mastercard, Elo, Hipercard, Amex).'], ['credit-card', 'Cartão de débito', 'Débito em conta, com aprovação rápida.'], ['banknote', 'Dinheiro', 'Pagamento em espécie, na entrega.']];

function PayRow({ r }) {
  return (
    <div className="pay-row">
      <span className="pi"><Icon name={r[0]} className={r[0] === 'diamond' ? 'pix' : ''} /></span>
      <div style={{ minWidth: 0 }}><b>{r[1]}</b><small>{r[2]}</small></div>
      <Toggle label={r[1]} />
    </div>
  );
}

export default function Pagamento() {
  return (
    <>
      <PageHead icon="wallet" variant="outline" title="Detalhes do Pagamento" sub="Configure as formas de pagamento, taxas e informações bancárias da sua loja." />
      <form className="form-stack" style={{ gap: 20 }} onSubmit={(e) => { e.preventDefault(); toast('Alterações salvas'); }}>
        <div className="two-col">
          <div className="card card-pad"><SecHead icon="wallet" title="Formas de pagamento" sub="Escolha quais formas de pagamento você aceita na sua loja." /><div className="pay-list">{PRES.map((r) => <PayRow key={r[1]} r={r} />)}</div></div>
          <div className="card card-pad"><SecHead icon="landmark" title="Pix e dados bancários" sub="Informe os dados da sua conta bancária para receber os pagamentos das vendas." />
            <div className="form-stack">
              <div className="field"><label htmlFor="bk">Banco <span className="req">*</span></label><select className="sel" id="bk" defaultValue="Banco do Brasil">{['Banco do Brasil', 'Caixa Econômica Federal', 'Itaú', 'Bradesco', 'Nubank', 'Sicoob'].map((b) => <option key={b}>{b}</option>)}</select></div>
              <div className="row2">
                <div className="field"><label htmlFor="ag">Agência <span className="req">*</span></label><div className="inp"><input id="ag" defaultValue="1234" inputMode="numeric" /></div></div>
                <div className="field"><label htmlFor="ct">Conta <span className="req">*</span></label><div className="inp"><input id="ct" defaultValue="56789-0" /></div></div>
              </div>
              <div className="field"><span className="lab">Tipo de conta <span className="req">*</span></span><div style={{ display: 'flex', gap: 28 }}><label className="radio"><input type="radio" name="tc" defaultChecked /><b>Corrente</b></label><label className="radio"><input type="radio" name="tc" /><b>Poupança</b></label></div></div>
              <Info>Os dados informados serão utilizados para receber os pagamentos das suas vendas, através do Pix e da transferência bancária.</Info>
            </div></div>
          <div className="card card-pad"><SecHead icon="smartphone" title="Pagamento online (pré-pagamento)" sub="Configure as formas de pagamento que serão aceitas para pedidos pagos online." /><div className="pay-list">{[PRES[2], PRES[1]].map((r) => <PayRow key={r[1]} r={r} />)}</div></div>
          <div className="card card-pad"><SecHead icon="settings" title="Configurações adicionais" sub="Personalize as informações que serão exibidas para os seus clientes." />
            <div className="field"><label htmlFor="ip">Instruções de pagamento <span className="opt">(opcional)</span></label><FreeText id="ip" rows={4} max={300} placeholder="Ex.: Para pagamentos no cartão, o valor será liberado após a confirmação da operadora. Em caso de dúvidas, entre em contato conosco." /></div></div>
        </div>
        <div className="card card-pad"><SecHead icon="clipboard-list" title="Observações" sub="Adicione qualquer informação extra sobre o pagamento da sua loja." /><FreeText id="obsPg" max={300} placeholder="Ex.: Não aceitamos pagamentos por aproximação. Informe ao cliente que o pagamento deve ser feito no ato da retirada." /></div>
        <div className="form-actions"><button type="button" className="btn btn-outline" onClick={() => navigate('visao-geral')}>Cancelar</button><button className="btn btn-primary">Salvar alterações</button></div>
      </form>
    </>
  );
}
