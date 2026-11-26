// Gerador mínimo de ZIP (sem compressão), sem bibliotecas externas.
const TABELA_CRC = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(bytes) {
  let c = 0xffffffff;
  for (const b of bytes) c = TABELA_CRC[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

// Monta um cabeçalho binário a partir de pares [tamanhoEmBytes, valor].
function cabecalho(campos) {
  const total = campos.reduce((soma, [tam]) => soma + tam, 0);
  const view = new DataView(new ArrayBuffer(total));
  let pos = 0;
  for (const [tam, valor] of campos) {
    if (tam === 2) view.setUint16(pos, valor, true);
    else view.setUint32(pos, valor, true);
    pos += tam;
  }
  return new Uint8Array(view.buffer);
}

// arquivos: [{ nome: "pasta/arquivo.txt", conteudo: "texto" }]
function criarZip(arquivos) {
  const encoder = new TextEncoder();
  const locais = [];
  const central = [];
  const agora = new Date();
  const hora = (agora.getHours() << 11) | (agora.getMinutes() << 5) | (agora.getSeconds() >> 1);
  const data = ((agora.getFullYear() - 1980) << 9) | ((agora.getMonth() + 1) << 5) | agora.getDate();
  let deslocamento = 0;

  for (const arquivo of arquivos) {
    const nome = encoder.encode(arquivo.nome);
    const dados = encoder.encode(arquivo.conteudo);
    // versão, flags (0x0800 = nomes em UTF-8), método 0, hora, data, crc, tamanhos, nome, extra
    const comum = [[2, 20], [2, 0x0800], [2, 0], [2, hora], [2, data],
      [4, crc32(dados)], [4, dados.length], [4, dados.length], [2, nome.length], [2, 0]];

    const local = cabecalho([[4, 0x04034b50], ...comum]);
    locais.push(local, nome, dados);

    // 0x031e = criado em Unix; atributos externos 0100644 (arquivo comum)
    central.push(cabecalho([[4, 0x02014b50], [2, 0x031e], ...comum,
      [2, 0], [2, 0], [2, 0], [4, (0o100644 << 16) >>> 0], [4, deslocamento]]), nome);

    deslocamento += local.length + nome.length + dados.length;
  }

  const tamanhoCentral = central.reduce((soma, parte) => soma + parte.length, 0);
  const fim = cabecalho([[4, 0x06054b50], [2, 0], [2, 0],
    [2, arquivos.length], [2, arquivos.length],
    [4, tamanhoCentral], [4, deslocamento], [2, 0]]);

  return new Blob([...locais, ...central, fim], { type: "application/zip" });
}
