import { Component } from 'react';
import Icon from './Icon';

/** Se uma parte da tela quebrar, mostra um aviso só nela em vez de derrubar o painel inteiro. */
export default class ErrorBoundary extends Component {
  state = { erro: null };
  static getDerivedStateFromError(erro) { return { erro }; }
  componentDidCatch(erro, info) { console.error('Erro na tela:', erro, info?.componentStack); }
  render() {
    if (!this.state.erro) return this.props.children;
    if (this.props.fallback !== undefined) return this.props.fallback;
    return (
      <div className="card empty">
        <span className="ico-c lg red"><Icon name="alert-triangle" /></span>
        <h3>Algo deu errado nesta tela</h3>
        <p>Os seus dados continuam salvos. Tente abrir a tela de novo.</p>
        <button className="btn btn-outline" style={{ marginTop: 14 }} onClick={() => this.setState({ erro: null })}><Icon name="refresh-cw" /> Tentar de novo</button>
      </div>
    );
  }
}
