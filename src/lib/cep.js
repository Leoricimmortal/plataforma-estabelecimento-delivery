// Busca de CEP: 1º ViaCEP, 2º BrasilAPI. Sem internet, identifica cidade e UF pela faixa do CEP.
// Em produção, prefira fazer esta busca pelo seu back-end, com cache.
const CEP_UF = [[1000,19999,'SP'],[20000,28999,'RJ'],[29000,29999,'ES'],[30000,39999,'MG'],[40000,48999,'BA'],[49000,49999,'SE'],[50000,56999,'PE'],[57000,57999,'AL'],[58000,58999,'PB'],[59000,59999,'RN'],[60000,63999,'CE'],[64000,64999,'PI'],[65000,65999,'MA'],[66000,68899,'PA'],[68900,68999,'AP'],[69000,69299,'AM'],[69300,69399,'RR'],[69400,69899,'AM'],[69900,69999,'AC'],[70000,72799,'DF'],[72800,72999,'GO'],[73000,73699,'DF'],[73700,76799,'GO'],[76800,76999,'RO'],[77000,77999,'TO'],[78000,78899,'MT'],[79000,79999,'MS'],[80000,87999,'PR'],[88000,89999,'SC'],[90000,99999,'RS']];
const CEP_CID = [[74000,74899,'Goiânia'],[74900,74999,'Aparecida de Goiânia'],[75000,75159,'Anápolis'],[75250,75264,'Senador Canedo'],[75380,75394,'Trindade'],[70000,72799,'Brasília'],[1000,5999,'São Paulo'],[8000,8499,'São Paulo'],[20000,23799,'Rio de Janeiro'],[30000,31999,'Belo Horizonte']];
export const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

async function getJson(url) {
  const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 5000);
  try { const r = await fetch(url, { signal: ctl.signal }); return { status: r.status, json: r.ok ? await r.json() : null }; }
  finally { clearTimeout(to); }
}

/**
 * @returns {Promise<{erro?:string, completo?:boolean, rua?:string, bairro?:string, cidade?:string, uf?:string}>}
 */
export async function buscarCep(cep) {
  const d = String(cep).replace(/\D/g, '');
  if (d.length !== 8) return { erro: 'O CEP precisa ter 8 dígitos.' };
  let respondeu = false;
  try {
    const r = await getJson(`https://viacep.com.br/ws/${d}/json/`); respondeu = true;
    if (r.json && !r.json.erro) return { completo: true, rua: r.json.logradouro, bairro: r.json.bairro, cidade: r.json.localidade, uf: r.json.uf };
  } catch { /* tenta o próximo */ }
  try {
    const r = await getJson(`https://brasilapi.com.br/api/cep/v2/${d}`); respondeu = true;
    if (r.json) return { completo: true, rua: r.json.street, bairro: r.json.neighborhood, cidade: r.json.city, uf: r.json.state };
  } catch { /* sem conexão */ }
  if (respondeu) return { erro: 'CEP não encontrado. Confira os números.' };
  const n = +d.slice(0, 5), uf = CEP_UF.find((x) => n >= x[0] && n <= x[1])?.[2], cidade = CEP_CID.find((x) => n >= x[0] && n <= x[1])?.[2];
  if (!uf) return { erro: 'CEP fora das faixas conhecidas. Confira os números.' };
  return { completo: false, offline: true, cidade: cidade || '', uf };
}

/** Texto de ajuda mostrado embaixo do campo CEP. */
export function cepMensagem(r, setorLbl = 'bairro/setor') {
  if (r.erro) return { tipo: 'err', texto: r.erro };
  if (r.completo && r.rua) return { tipo: 'ok', texto: `Encontrado: ${r.rua}, ${r.bairro} - ${r.cidade}/${r.uf}. Falta só o número.` };
  if (r.completo) return { tipo: 'ok', texto: `CEP geral de ${r.cidade}/${r.uf}, sem rua cadastrada. Preencha rua e ${setorLbl}.` };
  return { tipo: 'warn', texto: `Sem conexão com a busca de CEP agora. ${r.cidade ? r.cidade + '/' : ''}${r.uf} identificados pela faixa do CEP; preencha rua e ${setorLbl}.` };
}
