// Clientes: última compra considera o cadastro e os pedidos feitos com o mesmo nome.
export function ultimaCompra(c, pedidos) {
  const nome = c.nome.toLowerCase();
  const ps = pedidos.filter((p) => p.cli.toLowerCase() === nome && p.status !== 'cancelado').map((p) => p.created);
  return Math.max(c.ult || 0, ...ps) || null;
}
export const proximoNumero = (pedidos) => (pedidos.length ? Math.max(...pedidos.map((p) => p.num)) + 1 : 1);
