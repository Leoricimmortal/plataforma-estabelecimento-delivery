import { useRoute } from '../../hooks/useRoute';
import Login from './Login';
import Cadastro from './Cadastro';
import Recuperar from './Recuperar';
import '../../styles/auth.css';

const TELAS = { login: Login, cadastro: Cadastro, recuperar: Recuperar };

/** Telas exibidas enquanto não há sessão: #login (padrão), #cadastro e #recuperar. */
export default function AuthGate() {
  const route = useRoute(Object.keys(TELAS), 'login');
  const Tela = TELAS[route];
  return <Tela key={route} />;
}
