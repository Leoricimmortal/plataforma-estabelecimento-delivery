// Estado inicial do painel: ZERADO (sem pedidos, produtos, clientes etc.).
// Os dados da loja e do usuário são preenchidos no login/cadastro (ver store/auth.js).
import { novoCodigoConta } from '../lib/format';
import { horariosIniciais } from '../lib/hours';

export function buildInitialState() {
  return {
    now: Date.now(),
    loja: { nome: '', tipo: '', cep: '', rua: '', nro: '', cpl: '', bai: '', cid: '', uf: '', cnpj: '', wpp: '', pm: '', code: novoCodigoConta() },
    logo: null,
    hours: horariosIniciais(),
    override: null,
    users: [],
    coupons: [],
    categories: [],
    kits: [],
    comps: [],
    pedidos: [],
    clientes: [],
    fid: { on: true, n: 8, cond: 'compra', valor: '50,00', tipo: '', premio: 'brinde', brinde: '', cupom: '15', desc: '10,00', outro: '', validade: '90 dias', msg: '', sel: 0 },
    fidClients: [],
    print: { printer: '', auto: true, paper: '58', vias: 1 },
    som: { on: true, vol: 70, sound: 'padrao', ev: { novo: true, status: true, cancel: true, final: true } },
    chats: {},
    chatOpen: null,
    chatMin: false,
    ui: { catSel: '', catCollapsed: false, catQ: '', organize: false, kitOrganize: false, coletaSel: null, panels: { usuarios: true, cupons: true, complementos: true }, userTab: 'dados', navOpen: false, modal: null },
  };
}
