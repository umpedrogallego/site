/**
 * CONFIGURAÇÃO DA APRESENTAÇÃO
 * Edite livremente os tempos, tipos e itens abaixo.
 */

const APRESENTACAO = [
  // TELA 1: Vídeo Sequenciado (com cortes automáticos)
  {
    id: "obra-01",
    titulo: "Sessão Inicial",
    ano: "2024",
    tipo: "video-sequenciado",
    provedor: "youtube",
    videoId: "zujWETunt7U",
    aspectRatio: "16:9",
    qualidade: "hd1080",
    desabilitarLegenda: true,
    // 00:07 - 00:20 (7s a 20s)
    // 03:50 - 06:31 (230s a 391s)
    // 24:45 - 27:00 (1485s a 1620s)
    segmentos: [
      { start: 7, end: 20 },
      { start: 230, end: 391 },
      { start: 1485, end: 1620 }
    ],
    thumb: "https://img.youtube.com/vi/zujWETunt7U/hqdefault.jpg"
  },

  // TELA 2: Acordo de Emergência
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
    fim: null, // null reproduz até o fim do vídeo
    thumb: "https://img.youtube.com/vi/aBOofS3Oy94/hqdefault.jpg"
  },

  // TELA 3: Torcida (Galeria horizontal)
  {
    id: "obra-03",
    titulo: "Torcida",
    ano: "2025",
    tipo: "galeria-horizontal",
    gap: 24, // espaçamento em px
    imagens: [
      "https://umpedrogallego.github.io/site/thumb/25-torcida-a.avif",
      "https://umpedrogallego.github.io/site/thumb/25-torcida-d.avif",
      "https://umpedrogallego.github.io/site/thumb/25-torcida-c.avif",
      "https://umpedrogallego.github.io/site/thumb/25-torcida-e.avif",
      "https://umpedrogallego.github.io/site/thumb/25-torcida-b.avif"
    ],
    thumb: "https://umpedrogallego.github.io/site/thumb/25-torcida-a.avif"
  },

  // TELA 4: Nada machuca nem cansa (4:3)
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
    thumb: "https://img.youtube.com/vi/8v-c49j2dks/hqdefault.jpg"
  },

  // TELA 5: Domingo Maior (Publicação)
  {
    id: "obra-05",
    titulo: "Domingo Maior",
    ano: "2013",
    tipo: "publicacao-galeria",
    gap: 24,
    imagens: [
      "https://umpedrogallego.github.io/site/thumb/13-dm-a.avif",
      "https://umpedrogallego.github.io/site/thumb/13-dm-b.avif",
      "https://umpedrogallego.github.io/site/thumb/13-dm-c.avif"
    ],
    thumb: "https://umpedrogallego.github.io/site/thumb/13-dm-a.avif"
  },

  // TELA 6: Reprise (Vídeo nativo local/MP4)
  {
    id: "obra-06",
    titulo: "Reprise",
    ano: "2017",
    tipo: "video-nativo",
    provedor: "local",
    // Coloque o arquivo MP4 na mesma pasta do projeto ou num caminho relativo/pendrive
    src: "reprise-2017.mp4",
    aspectRatio: "16:9",
    inicio: 0,
    fim: null,
    thumb: "https://umpedrogallego.github.io/site/thumb/25-torcida-a.avif" // substitua pela thumb do Reprise se tiver
  }
];
