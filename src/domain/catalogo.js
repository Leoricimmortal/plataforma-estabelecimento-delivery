// Catálogo: ordem única de produtos e kits por categoria.

/** Lista ordenada da categoria: [{tipo:'prod'|'kit', item}] seguindo cat.seq (ids). */
export function catList(cat, kits) {
  const doCat = kits.filter((k) => k.cat === cat.n);
  const byId = new Map([...cat.items.map((i) => [i.id, { tipo: 'prod', item: i }]), ...doCat.map((k) => [k.id, { tipo: 'kit', item: k }])]);
  const ids = (cat.seq || []).filter((id) => byId.has(id));
  for (const id of byId.keys()) if (!ids.includes(id)) ids.push(id);
  return ids.map((id) => byId.get(id));
}
export const catCount = (cat, kits) => cat.items.length + kits.filter((k) => k.cat === cat.n).length;

export function moveIn(arr, from, to) {
  if (from === to || to < 0 || to >= arr.length) return false;
  const [it] = arr.splice(from, 1); arr.splice(to, 0, it); return true;
}
/** Move dentro da categoria (alterando o draft). */
export function moverNaCategoria(s, catNome, from, to) {
  const cat = s.categories.find((c) => c.n === catNome); if (!cat) return false;
  const ids = catList(cat, s.kits).map((r) => r.item.id);
  if (!moveIn(ids, from, to)) return false;
  cat.seq = ids; return true;
}
export const allProducts = (s) => s.categories.flatMap((c) => c.items.map((p) => ({ ...p, cat: c.n })));

export const CAT_ICONS = [['sandwich', 'Hambúrguer'], ['pizza', 'Pizza'], ['popcorn', 'Porções'], ['cup-soda', 'Bebidas'], ['cake-slice', 'Sobremesas'], ['star', 'Extras'], ['concierge-bell', 'Pratos'], ['salad', 'Saladas'], ['utensils-crossed', 'Refeições'], ['more-horizontal', 'Outro']];
/** Itens industrializados do catálogo geral (no real, vem de uma base de códigos de barras). */
export const CATALOGO_GERAL = [
  { nome: 'Coca-Cola Lata 350ml', marca: 'Coca-Cola', preco: 5.49, thumb: '🥤' },
  { nome: 'Guaraná Antarctica Lata 350ml', marca: 'Ambev', preco: 4.99, thumb: '🥤' },
  { nome: 'Água Mineral sem Gás 500ml', marca: 'Crystal', preco: 2.99, thumb: '💧' },
  { nome: 'Chocolate KitKat 41,5g', marca: 'Nestlé', preco: 4.5, thumb: '🍫' },
  { nome: 'Salgadinho Doritos 84g', marca: 'Elma Chips', preco: 8.99, thumb: '🌽' },
  { nome: 'Suco Del Valle Uva 290ml', marca: 'Del Valle', preco: 4.79, thumb: '🧃' },
];
