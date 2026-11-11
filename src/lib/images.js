// Imagens com tamanho padrão: recorta no centro e ajusta para um quadrado fixo.
const IMG_OK = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
export const IMG_SPEC = {
  logo: { min: 200, out: 512 },
  item: { min: 300, out: 800 },
};

/**
 * Lê, valida e padroniza a imagem.
 * @returns {Promise<{url:string, info:string, name:string}>} rejeita com Error(mensagem para o usuário)
 */
export function readImage(file, kind = 'item') {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('Nenhum arquivo selecionado.'));
    if (!IMG_OK.includes(file.type)) return reject(new Error('Formato não aceito. Envie PNG ou JPG.'));
    if (file.size > 2 * 1024 * 1024) return reject(new Error(`A imagem tem ${(file.size / 1048576).toFixed(1)}MB. O limite é 2MB.`));
    const spec = IMG_SPEC[kind] || IMG_SPEC.item, url = URL.createObjectURL(file), img = new Image();
    img.onload = () => {
      const w = img.naturalWidth, h = img.naturalHeight; URL.revokeObjectURL(url);
      if (Math.min(w, h) < spec.min) return reject(new Error(`A imagem tem ${w} × ${h} px. O mínimo é ${spec.min} × ${spec.min} px.`));
      const side = Math.min(w, h), c = document.createElement('canvas'); c.width = c.height = spec.out;
      const ctx = c.getContext('2d'); ctx.imageSmoothingQuality = 'high';
      if (file.type !== 'image/png') { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, spec.out, spec.out); }
      ctx.drawImage(img, (w - side) / 2, (h - side) / 2, side, side, 0, 0, spec.out, spec.out);
      const data = c.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.88);
      resolve({ url: data, name: file.name, info: w !== h ? `Recortada no centro e ajustada para ${spec.out} × ${spec.out} px` : `Ajustada para ${spec.out} × ${spec.out} px` });
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Não foi possível abrir a imagem.')); };
    img.src = url;
  });
}
