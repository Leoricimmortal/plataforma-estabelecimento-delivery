// Componentes pequenos reutilizados em várias telas.
import { useState } from 'react';
import Icon from './Icon';
import { ST } from '../domain/pedidos';
import { readImage } from '../lib/images';
import { toast, closeModal } from '../store/useApp';

export function PageHead({ icon, title, sub, actions, variant = '', crumb, back }) {
  return (
    <div className="page-head">
      <span className={`ph-ico ${variant}`}><Icon name={icon} /></span>
      <div>
        {crumb}
        {back && <a className="back" href={`#${back.to}`}><Icon name="arrow-left" /> {back.label}</a>}
        <h1>{title}</h1>
        <p>{sub}</p>
      </div>
      {actions && <div className="actions">{actions}</div>}
    </div>
  );
}

export function Delta({ d, note = '' }) {
  const up = !String(d).startsWith('-');
  return (
    <div className="delta">
      <b><Icon name={up ? 'arrow-up' : 'arrow-down'} />{up ? '+' : ''}{String(d).replace('+', '')}</b>{note}
    </div>
  );
}

export function Stat({ icon, color = '', label, value, d, note = 'em relação ao período anterior', go = false, dark = false, extra }) {
  return (
    <div className="card stat">
      <span className={`ico-c lg ${color}`}><Icon name={icon} /></span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div className={`lbl ${dark ? 'dark' : ''}`}>{label}</div>
        <div className="val">{value}</div>
        {d !== undefined && <Delta d={d} note={note} />}
        {extra}
      </div>
      {go && <Icon name="chevron-right" className="go" />}
    </div>
  );
}

export const Pill = ({ tone = 'p-gray', icon, children, className = '', style }) => (
  <span className={`pill ${tone} ${className}`} style={style}>{icon && <Icon name={icon} />}{children}</span>
);
export const StPill = ({ status }) => <span className={`pill ${ST[status][1]}`}>{ST[status][0]}</span>;

export function Stars({ n, inline = false }) {
  return (
    <span className="stars" style={inline ? { marginLeft: 0 } : undefined}>
      {[1, 2, 3, 4, 5].map((i) => <Icon key={i} name="star" className={i <= n ? '' : 'off'} />)}
    </span>
  );
}

export function Switch({ checked, onChange, label, variant = '', style, disabled }) {
  return (
    <label className={`switch ${variant}`} aria-label={label} style={style}>
      <input type="checkbox" checked={!!checked} disabled={disabled} onChange={(e) => onChange?.(e.target.checked)} />
      <span />
    </label>
  );
}

/** Paginação com reticências: 1 … 4 5 6 … 20 */
export function Pager({ page, pages, onPage }) {
  const nums = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - page) <= 1) nums.push(i);
    else if (nums[nums.length - 1] !== '…') nums.push('…');
  }
  return (
    <div className="pager">
      <button disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Anterior"><Icon name="chevron-left" /></button>
      {nums.map((n, i) => (n === '…' ? <span key={`e${i}`} className="hint">…</span> : <button key={n} className={n === page ? 'on' : ''} onClick={() => onPage(n)}>{n}</button>))}
      <button disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label="Próxima"><Icon name="chevron-right" /></button>
    </div>
  );
}

/** Paginação de uma lista: devolve a fatia da página e o rodapé pronto. */
export function usePaged(rows, per) {
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(rows.length / per));
  const cur = Math.min(page, pages);
  const slice = rows.slice((cur - 1) * per, cur * per);
  const foot = (nomeUm, nomeVarios) => (
    <div className="tbl-foot">
      <span>Mostrando {rows.length ? (cur - 1) * per + 1 : 0} a {Math.min(cur * per, rows.length)} de {rows.length} {rows.length === 1 ? nomeUm : nomeVarios}</span>
      <Pager page={cur} pages={pages} onPage={setPage} />
    </div>
  );
  return { slice, foot, reset: () => setPage(1) };
}

export function TextArea({ value, onChange, max, ...rest }) {
  return (
    <>
      <textarea className="ta" maxLength={max} value={value} onChange={(e) => onChange(e.target.value)} {...rest} />
      <div className="counter">{value.length}/{max}</div>
    </>
  );
}

export const Info = ({ icon = 'info', children, className = '', style }) => (
  <div className={`info ${className}`} style={style}><Icon name={icon} /><span>{children}</span></div>
);

export const SecHead = ({ icon, title, sub, children }) => (
  <div className="sec-h"><Icon name={icon} /><div style={{ flex: 1 }}><h3>{title}</h3>{sub && <p>{sub}</p>}</div>{children}</div>
);

/** Miniatura: imagem enviada ou emoji. */
export const Thumb = ({ item, className = '', style }) => (
  <span className={`thumb ${className}`} style={style}>{item?.img ? <img src={item.img} alt="" /> : item?.thumb}</span>
);

export const PayIcon = ({ pg }) => (pg === 'Pix' ? <Icon name="diamond" className="pix" /> : pg === 'Dinheiro' ? <Icon name="banknote" /> : <Icon name="credit-card" />);

export function Stepper({ value, onChange, min = 1, max = 99, big = false, label = '' }) {
  return (
    <div className={`stepper ${big ? 'big' : ''}`}>
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} aria-label={`Menos ${label}`}>−</button>
      <span>{value}</span>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} aria-label={`Mais ${label}`}>+</button>
    </div>
  );
}

/** Área de envio de imagem (clique ou arrastar), com padronização de tamanho. */
export function UploadZone({ value, onChange, kind = 'item', hint = 'Quadrada, 800 × 800 px (mínimo 300 × 300). PNG ou JPG até 2MB.' }) {
  const [over, setOver] = useState(false);
  const take = async (file) => {
    try { const r = await readImage(file, kind); onChange(r); }
    catch (e) { toast(e.message); }
  };
  return (
    <label
      className={`upload ${value ? 'has' : ''} ${over ? 'over' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); take(e.dataTransfer.files[0]); }}
    >
      {value ? (
        <>
          <span className="up-prev"><img src={value.url} alt="Prévia" /></span>
          <span><b>{value.name}</b><br />{value.info}. Clique ou arraste outra para trocar.</span>
          <button type="button" className="icon-btn up-del" onClick={(e) => { e.preventDefault(); onChange(null); }} aria-label="Remover imagem"><Icon name="x" /></button>
        </>
      ) : (
        <>
          <span className="u-ico"><Icon name="image" /></span>
          <span><b>Clique para enviar</b> ou arraste a imagem<br />{hint}</span>
        </>
      )}
      <input type="file" accept="image/png,image/jpeg" hidden onChange={(e) => { take(e.target.files[0]); e.target.value = ''; }} />
    </label>
  );
}

/** Botão com confirmação em dois cliques (para excluir). */
export function ArmedButton({ onConfirm, className = 'icon-btn del', label, children, confirmMsg = 'Clique de novo na lixeira para confirmar a exclusão' }) {
  const [armed, setArmed] = useState(false);
  return (
    <button
      type="button"
      className={`${className} ${armed ? 'armed' : ''}`}
      aria-label={label}
      onClick={() => {
        if (!armed) { setArmed(true); toast(confirmMsg); setTimeout(() => setArmed(false), 4000); return; }
        setArmed(false); onConfirm();
      }}
    >
      {children || <Icon name="trash-2" />}
    </button>
  );
}

/** Seleciona/desmarca todas as caixas de uma tabela (só visual, como na versão original). */
export const CheckAll = () => (
  <input type="checkbox" aria-label="Selecionar todos" onChange={(e) => e.target.closest('table').querySelectorAll('tbody input[type=checkbox]').forEach((c) => { c.checked = e.target.checked; })} />
);

export const Empty = ({ icon, iconTone = 'green', title, children, style }) => (
  <div className="card empty" style={style}>
    {icon && <span className={`ico-c lg ${iconTone}`}><Icon name={icon} /></span>}
    <h3>{title}</h3>
    {children}
  </div>
);

/** Cabeçalho padrão das janelas. */
export const ModalHead = ({ icon, title, children, onBack }) => (
  <div className="modal-h">
    {onBack && <button type="button" className="icon-btn" onClick={onBack} aria-label="Voltar"><Icon name="chevron-left" /></button>}
    <Icon name={icon} /><h2>{title}</h2>{children}
    <button type="button" className="icon-btn x" onClick={closeModal} aria-label="Fechar"><Icon name="x" /></button>
  </div>
);

/**
 * Confere campos obrigatórios. campos = [[valor, idDoInput], ...].
 * Se algum estiver vazio, foca nele, marca a borda e avisa. Devolve true se está tudo preenchido.
 */
export function exigir(campos) {
  for (const [v, id] of campos) {
    if (!String(v ?? '').trim()) {
      const el = document.getElementById(id);
      el?.focus();
      el?.closest('.field')?.querySelector('.inp')?.style.setProperty('border-color', 'var(--red)');
      toast('Preencha os campos obrigatórios');
      return false;
    }
  }
  return true;
}

/** Caixa de texto com contador e estado próprio (para campos que ainda não são salvos). */
export function FreeText({ max, initial = '', ...rest }) {
  const [v, setV] = useState(initial);
  return <TextArea value={v} onChange={setV} max={max} {...rest} />;
}

/** Interruptor com estado próprio (para opções que ainda não são salvas). */
export function Toggle({ defaultChecked = true, onChange, ...rest }) {
  const [v, setV] = useState(defaultChecked);
  return <Switch checked={v} onChange={(x) => { setV(x); onChange?.(x); }} {...rest} />;
}
