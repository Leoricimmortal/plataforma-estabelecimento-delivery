// Planilhas Excel: planilha modelo, exportações e leitura da importação de clientes.
import * as XLSX from 'xlsx';
import { pad2, fmtDate, fmtTime, normTel, fmtTel, isoToBR } from './format';

const hoje = () => fmtDate(Date.now()).split('/').reverse().join('-');

function baixar(filename, sheets) {
  const wb = XLSX.utils.book_new();
  sheets.forEach(([name, rows, widths]) => {
    const ws = XLSX.utils.aoa_to_sheet(rows);
    if (widths) ws['!cols'] = widths.map((w) => ({ wch: w }));
    XLSX.utils.book_append_sheet(wb, ws, name);
  });
  XLSX.writeFile(wb, filename);
  return filename;
}

export const CLI_COLS = ['nome_cliente', 'telefone', 'endereco', 'setor', 'cidade', 'aniversario'];

export const baixarModelo = () => baixar('planilha-modelo-clientes.xlsx', [
  ['Clientes', [CLI_COLS, ['Maria Exemplo', '(62) 99999-0000', 'Rua 10, 245', 'Setor Bueno', 'Goiânia', '14/05/1994'], ['João Exemplo', '62988887777', '', '', 'Aparecida de Goiânia', '']], [24, 18, 28, 18, 22, 14]],
  ['Instruções', [['Como preencher'], ['1. Não altere os nomes das colunas da primeira linha.'], ['2. nome_cliente e telefone são obrigatórios.'], ['3. telefone: com DDD, com ou sem formatação. Ex: (62) 99999-0000 ou 62999990000.'], ['4. aniversario: dd/mm/aaaa. Pode ficar em branco.'], ['5. Apague as linhas de exemplo antes de importar.'], ['6. Telefones já cadastrados são ignorados na importação.']], [80]],
]);

export const exportarClientes = (clientes, ultimaCompra) => baixar(`clientes-${hoje()}.xlsx`, [
  ['Clientes', [[...CLI_COLS, 'ultima_compra', 'data_cadastro'], ...clientes.map((c) => { const u = ultimaCompra(c); return [c.nome, c.tel, c.end || '', c.setor || '', c.cidade || '', isoToBR(c.nasc), u ? fmtDate(u) : '', fmtDate(c.cad)]; })], [24, 18, 28, 18, 22, 14, 14, 14]],
]);

export const exportarPedidos = (pedidos, ST) => baixar(`pedidos-${hoje()}.xlsx`, [
  ['Pedidos', [['pedido', 'data', 'hora', 'cliente', 'telefone', 'endereco', 'cidade', 'itens', 'valor', 'pagamento', 'tipo', 'status'], ...pedidos.map((p) => [p.num, fmtDate(p.created), fmtTime(p.created), p.cli, p.tel, p.end, p.cidade, p.itens, p.valor, p.pg, p.modo, ST[p.status][0]])], [8, 12, 8, 22, 16, 24, 20, 40, 10, 18, 10, 12]],
]);

const normKey = (k) => String(k).trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '_');
function parseNasc(v) {
  if (!v) return '';
  if (v instanceof Date && !isNaN(v)) return `${v.getFullYear()}-${pad2(v.getMonth() + 1)}-${pad2(v.getDate())}`;
  const m = String(v).trim().match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/);
  if (!m) return null;
  let [, d, mo, y] = m; y = +y < 100 ? (+y > 30 ? '19' : '20') + y : y;
  if (+mo < 1 || +mo > 12 || +d < 1 || +d > 31) return null;
  return `${y}-${pad2(mo)}-${pad2(d)}`;
}
const COLS_MAP = { nome_cliente: 'nome', nome: 'nome', cliente: 'nome', telefone: 'tel', celular: 'tel', whatsapp: 'tel', fone: 'tel', endereco: 'end', setor: 'setor', bairro: 'setor', cidade: 'cidade', aniversario: 'nasc', data_nascimento: 'nasc', nascimento: 'nasc' };

/**
 * Lê a planilha e separa linhas válidas, duplicadas e com erro.
 * @returns {Promise<{file, ok:Array, dup:Array, bad:Array}>} rejeita com Error(mensagem para o usuário)
 */
export function lerPlanilha(file, clientesAtuais) {
  return file.arrayBuffer().then((buf) => {
    let raw;
    try {
      const wb = XLSX.read(new Uint8Array(buf), { type: 'array', cellDates: true });
      raw = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '', raw: true });
    } catch { throw new Error('Não foi possível ler o arquivo. Use .xlsx, .xls ou .csv.'); }
    if (!raw.length) throw new Error('A planilha está vazia ou sem a linha de cabeçalho.');
    const have = new Set(clientesAtuais.map((c) => normTel(c.tel))), seen = new Set(), ok = [], bad = [], dup = [];
    raw.forEach((row, i) => {
      const o = {};
      for (const [k, v] of Object.entries(row)) { const f = COLS_MAP[normKey(k)]; if (f && !o[f]) o[f] = v; }
      const linha = i + 2, nome = String(o.nome || '').trim(), tel = normTel(o.tel);
      if (!nome && !tel) return;
      if (!nome) { bad.push({ linha, msg: 'nome_cliente vazio' }); return; }
      if (tel.length < 10 || tel.length > 11) { bad.push({ linha, msg: `telefone inválido para ${nome}` }); return; }
      const nasc = parseNasc(o.nasc);
      if (nasc === null) { bad.push({ linha, msg: `aniversário fora do formato dd/mm/aaaa (${nome})` }); return; }
      if (have.has(tel) || seen.has(tel)) { dup.push({ linha, msg: `${nome}: telefone ${fmtTel(tel)} já existe` }); return; }
      seen.add(tel);
      ok.push({ nome, tel: fmtTel(tel), end: String(o.end || '').trim(), setor: String(o.setor || '').trim(), cidade: String(o.cidade || '').trim(), nasc });
    });
    if (!ok.length && !bad.length && !dup.length) throw new Error('Nenhuma coluna reconhecida. Use a planilha modelo.');
    return { file: file.name, ok, bad, dup };
  });
}
