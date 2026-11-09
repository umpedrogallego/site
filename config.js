/**
 * CONFIGURAÇÃO DA APRESENTAÇÃO
 */
const APRESENTACAO = [
  {
    id: "obra-01",
    titulo: "Ficção de personalidade",
    ano: "2014",
    tipo: "video-sequenciado",
    provedor: "youtube",
    videoId: "zujWETunt7U",
    aspectRatio: "16:9",
    qualidade: "hd1080",
    desabilitarLegenda: true,
    segmentos: [
      { start: 7, end: 20 },
      { start: 230, end: 391 },
      { start: 1485, end: 1620 }
    ],
    fadeColor: "#000000" // Cor de saída pro modo espera
  },
  {
    id: "obra-02",
    titulo: "Acordo de Emergência",
    ano: "2020",
    tipo: "video-continuo",
    provedor: "youtube",
    videoId: "aBOofS3Oy94",
    aspectRatio: "16:9",
    qualidade: "hd1080",
    desabilitarLegenda: true,
    inicio: 0,
    fim: null,
    fadeColor: "#002d85" // Azul bafo
  },
  {
    id: "obra-03",
    titulo: "Torcida",
    ano: "2025",
    tipo: "galeria-horizontal",
    gap: 88,
    imagens: [
      "https://umpedrogallego.github.io/site/thumb/25-torcida-a.avif",
      "https://umpedrogallego.github.io/site/thumb/25-torcida-d.avif",
      "https://umpedrogallego.github.io/site/thumb/25-torcida-c.avif",
      "https://umpedrogallego.github.io/site/thumb/25-torcida-e.avif",
      "https://umpedrogallego.github.io/site/thumb/25-torcida-b.avif"
    ],
    fadeColor: "#000000" // Galerias não entram em espera, mas se precisarem de cor de saída, tá aqui
  },
  {
    id: "obra-04",
    titulo: "Nada machuca nem cansa",
    ano: "2022",
    tipo: "video-continuo",
    provedor: "youtube",
    videoId: "8v-c49j2dks",
    aspectRatio: "4:3",
    qualidade: "hd720",
    desabilitarLegenda: true,
    inicio: 0,
    fim: null,
    fadeColor: "#ff0000" // Vermelho sangrando pro próximo
  },
  {
    id: "obra-05",
    titulo: "Domingo Maior",
    ano: "2013",
    tipo: "publicacao-galeria",
    gap: 88,
    imagens: [
      "https://umpedrogallego.github.io/site/thumb/13-dm-a.avif",
      "https://umpedrogallego.github.io/site/thumb/13-dm-b.avif",
      "https://umpedrogallego.github.io/site/thumb/13-dm-c.avif"
    ],
    fadeColor: "#000000"
  }
];
