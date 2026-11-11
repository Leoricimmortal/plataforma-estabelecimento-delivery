import { useState } from 'react';
import Icon from '../components/Icon';
import { PageHead, SecHead, Toggle, FreeText } from '../components/ui';
import { toast } from '../store/useApp';
import { navigate } from '../store/actions';
import { uid } from '../lib/format';

export default function DetalhesEntrega() {
  const [taxas, setTaxas] = useState([
    { id: 't1', icon: 'map-pin', tipo: 'Zona adicional', cond: 'Região Sul', valor: 'R$ 4,00' },
    { id: 't2', icon: 'moon', tipo: 'Horário especial', cond: 'Após 22:00', valor: 'R$ 3,00' },
  ]);
  const remover = (id) => { setTaxas(taxas.filter((t) => t.id !== id)); toast('Taxa removida'); };

  return (
    <>
      <PageHead icon="truck" variant="outline" title="Detalhes de Entrega" sub="Configure as formas de entrega, taxas e áreas de cobertura da sua loja." />
      <form className="form-stack" style={{ gap: 20 }} onSubmit={(e) => { e.preventDefault(); toast('Alterações salvas'); }}>
        <div className="two-col">
          <div className="card card-pad"><SecHead icon="bike" title="Formas de entrega" sub="Escolha como você deseja realizar as entregas dos seus pedidos." />
            <div className="form-stack">
              <div className="pay-list"><div className="pay-row" style={{ padding: 18 }}><span className="ico-c lg" style={{ background: 'var(--orange-soft)', color: 'var(--orange)' }}><Icon name="bike" /></span><div><b>Entrega própria</b><small>Você mesmo faz a entrega dos pedidos.</small></div><Toggle label="Entrega própria" /></div></div>
              <div className="pay-list"><div className="pay-row" style={{ padding: 18 }}><span className="ico-c lg" style={{ background: '#eef3fa', color: 'var(--ink)' }}><Icon name="truck" /></span><div><b>Entrega por parceiros</b><small>Utilize os entregadores da plataforma.</small></div><Toggle defaultChecked={false} label="Entrega por parceiros" /></div></div>
            </div></div>
          <div className="card card-pad"><SecHead icon="store" title="Taxa de entrega" sub="Defina o valor da taxa de entrega e o valor mínimo para entrega grátis." />
            <div className="form-stack">
              <div className="row2">
                <div className="field"><label htmlFor="tx">Valor da taxa de entrega (R$) <span className="req">*</span></label><div className="inp"><span className="pre">R$</span><input id="tx" defaultValue="5,00" /></div></div>
                <div className="field"><label htmlFor="fg">Entrega grátis a partir de (R$)</label><div className="inp"><span className="pre">R$</span><input id="fg" defaultValue="50,00" /></div></div>
              </div>
              <div className="field"><label htmlFor="dm">Distância mínima para entrega <span className="opt">(opcional)</span></label><div className="inp"><Icon name="map-pin" /><input id="dm" defaultValue="0,5" /><span className="post">km</span></div><span className="hint" style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Icon name="info" /> A distância é calculada a partir do endereço da loja.</span></div>
            </div></div>
          <div className="card card-pad"><SecHead icon="clock" title="Tempo de entrega" sub="Informe o tempo médio para realizar a entrega dos pedidos." />
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div className="field" style={{ flex: '1 1 140px' }}><label htmlFor="tmin">Tempo mínimo</label><div className="inp"><span className="pre">min</span><input id="tmin" type="number" defaultValue="30" /></div></div>
              <div className="field" style={{ flex: '1 1 140px' }}><label htmlFor="tmax">Tempo máximo</label><div className="inp"><span className="pre">min</span><input id="tmax" type="number" defaultValue="60" /></div></div>
              <label className="radio" style={{ flex: '1 1 200px', paddingBottom: 10 }}><input type="checkbox" defaultChecked /><small>Mostrar tempo no app para o cliente</small></label>
            </div></div>
          <div className="card card-pad"><SecHead icon="shield" title="Área de cobertura" sub="Defina a região onde sua loja realiza entregas." />
            <div className="pay-list"><div className="pay-row" style={{ padding: 18 }}><span className="pi" style={{ width: 52, height: 52 }}><Icon name="map" /></span><div><small>Cobertura atual</small><b style={{ fontSize: 15 }}>Toda Goiânia - GO</b></div><button type="button" className="btn btn-outline btn-sm" style={{ marginLeft: 'auto' }} onClick={() => toast('Editor de área em breve')}><Icon name="pencil" /> Editar área</button></div></div></div>
        </div>
        <div className="card card-pad"><SecHead icon="coins" title={<>Taxas adicionais <span className="opt" style={{ fontWeight: 500, fontSize: 12 }}>(opcional)</span></>} sub="Adicione taxas extras para determinadas regiões ou condições." />
          <div className="tbl-wrap"><table className="tbl"><thead><tr><th>Tipo</th><th>Condição</th><th>Valor</th><th>Ações</th></tr></thead><tbody>
            {taxas.map((t) => t.nova ? (
              <tr key={t.id}>
                <td><div className="inp" style={{ minHeight: 34 }}><input placeholder="Tipo" aria-label="Tipo" /></div></td>
                <td><div className="inp" style={{ minHeight: 34 }}><input placeholder="Condição" aria-label="Condição" /></div></td>
                <td><div className="inp" style={{ minHeight: 34 }}><span className="pre">R$</span><input placeholder="0,00" aria-label="Valor" /></div></td>
                <td><button type="button" className="icon-btn" style={{ color: 'var(--red)' }} onClick={() => remover(t.id)} aria-label="Excluir"><Icon name="trash-2" /></button></td>
              </tr>
            ) : (
              <tr key={t.id}><td><Icon name={t.icon} /> {t.tipo}</td><td>{t.cond}</td><td>{t.valor}</td>
                <td><div className="acts"><button type="button" className="icon-btn" aria-label="Editar"><Icon name="pencil" /></button><button type="button" className="icon-btn" style={{ color: 'var(--red)' }} aria-label="Excluir" onClick={() => remover(t.id)}><Icon name="trash-2" /></button></div></td></tr>
            ))}
          </tbody></table></div>
          <button type="button" className="btn btn-outline btn-sm" style={{ marginTop: 14 }} onClick={() => setTaxas([...taxas, { id: uid('t'), nova: true }])}><Icon name="plus" /> Adicionar taxa</button></div>
        <div className="card card-pad"><SecHead icon="clipboard-list" title="Observações" sub="Se desejar, adicione alguma observação sobre as entregas da sua loja." /><FreeText max={300} placeholder="Ex: Não realizamos entregas em dias de chuva intensa." aria-label="Observações" /></div>
        <div className="form-actions"><button type="button" className="btn btn-outline" onClick={() => navigate('visao-geral')}>Cancelar</button><button className="btn btn-primary">Salvar alterações</button></div>
      </form>
    </>
  );
}
