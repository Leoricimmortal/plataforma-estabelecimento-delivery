// Peças compartilhadas das telas de acesso (login, cadastro, recuperar senha).
import { useState } from 'react';
import Icon from '../../components/Icon';
import { BrandMark } from '../../components/art';

export const Logo = ({ light = false, size = 'md' }) => (
  <div className={`au-logo ${light ? 'on-light' : ''} ${size}`}>
    <BrandMark />
    <div><b>Chegou</b><small>DELIVERY</small></div>
  </div>
);

/** Campo com ícone à esquerda; type="password" ganha o botão de mostrar/ocultar. */
export function AuthField({ icon, type = 'text', hint, error, ...rest }) {
  const [ver, setVer] = useState(false);
  const senha = type === 'password';
  return (
    <div className={`au-field-wrap ${error ? 'has-err' : ''}`}>
      <label className="au-field">
        <Icon name={icon} />
        <input type={senha && ver ? 'text' : type} {...rest} />
        {senha && (
          <button type="button" className="au-eye" onClick={() => setVer((v) => !v)} aria-label={ver ? 'Ocultar senha' : 'Mostrar senha'}>
            <Icon name={ver ? 'eye' : 'eye-off'} />
          </button>
        )}
      </label>
      {error ? <small className="au-err" role="alert">{error}</small> : hint && <small className="au-hint">{hint}</small>}
    </div>
  );
}
