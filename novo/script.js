const URL_JSON = "https://umpedrogallego.github.io/site/json/trabalhos.json";
const THUMB_BASE = "https://umpedrogallego.github.io/site/thumb/";
const MIDIA_BASE = "https://umpedrogallego.github.io/site/midia/";
const PLAYER_BASE = "https://umpedrogallego.github.io/site/player/";

document.addEventListener('DOMContentLoaded', async () => {
    let validData = [];
    let gridWorks = [];

    // Seletores Principais
    const titlesContainer = document.getElementById('titles-list');
    const gridView = document.getElementById('grid-view');
    const gridLayer = document.getElementById('grid-layer');
    const expandedLayer = document.getElementById('expanded-layer');
    const expandedView = document.getElementById('expanded-view');
    const fichaCol = document.getElementById('ficha-col');
    
    // Accordion Logic
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            // Close all
            document.querySelectorAll('.accordion-item').forEach(item => {
                item.classList.remove('active');
                const icon = item.querySelector('.acc-icon');
                if (icon) icon.textContent = '\\/';
            });
            // Open clicked
            header.parentElement.classList.add('active');
            const icon = header.querySelector('.acc-icon');
            if (icon) icon.textContent = '/\\';
        });
    });

    try {
        const res = await fetch(URL_JSON);
        const data = await res.json();
        
        validData = data.filter(w => w.DESTAQUE !== 'N' && w.INCLUIR !== "");
        validData.sort((a, b) => parseInt(a.DESTAQUE) - parseInt(b.DESTAQUE));

        const seenSeries = new Set();
        gridWorks = validData.filter(obra => {
            if (obra.SERIE && obra.SERIE.trim() !== "") {
                if (seenSeries.has(obra.SERIE)) return false;
                seenSeries.add(obra.SERIE);
                return true;
            }
            return true;
        });

        renderGrid();
    } catch(e) { 
        console.error("Erro no carregamento do JSON:", e); 
    }

    function renderGrid() {
        gridView.innerHTML = '';
        titlesContainer.innerHTML = '';

        gridWorks.forEach((work) => {
            // Coluna Esquerda: Títulos
            const titleEl = document.createElement('div');
            titleEl.className = 'list-item';
            titleEl.dataset.id = work.ID;
            titleEl.textContent = work.SERIE ? `série ${work.SERIE}` : work.TITULO;
            titleEl.addEventListener('click', () => openGallery(work.ID));
            titlesContainer.appendChild(titleEl);

            // Coluna Central: Thumbnails
            const thumbWrapper = document.createElement('div');
            thumbWrapper.className = 'thumb-wrapper';
            thumbWrapper.dataset.id = work.ID;
            
            if (work.MIDIA && work.MIDIA.length > 2) {
                const video = document.createElement('video');
                video.src = `${MIDIA_BASE}${work.ID}a.${work.MIDIA}`;
                video.autoplay = true;
                video.loop = true;
                video.muted = true;
                video.playsInline = true;
                thumbWrapper.appendChild(video);
            } else {
                const img = document.createElement('img');
                img.src = `https://umpedrogallego.github.io/site/img/grid/${work.ID}a.jpg`;
                thumbWrapper.appendChild(img);
            }
            
            thumbWrapper.addEventListener('click', () => openGallery(work.ID));
            gridView.appendChild(thumbWrapper);
        });

        initInteractions();
    }

    function initInteractions() {
        const thumbnails = document.querySelectorAll('.thumb-wrapper');
        const titles = document.querySelectorAll('.list-item');

        const resetAll = () => {
            titles.forEach(t => t.classList.remove('hover-active'));
        };

        const highlight = (id) => {
            titles.forEach(t => {
                if (id && t.dataset.id === id) {
                    t.classList.add('hover-active');
                } else {
                    t.classList.remove('hover-active');
                }
            });
        };

        titles.forEach(title => {
            title.addEventListener('mouseenter', () => {
                resetAll();
                highlight(title.dataset.id);
            });
            title.addEventListener('mouseleave', resetAll);
        });

        thumbnails.forEach(thumb => {
            thumb.addEventListener('mouseenter', () => {
                resetAll();
                highlight(thumb.dataset.id);
            });
            thumb.addEventListener('mouseleave', resetAll);
        });
    }

    function openGallery(id) {
        const mainObra = gridWorks.find(o => o.ID === id);
        const groupIndex = gridWorks.indexOf(mainObra);
        const serieObras = mainObra.SERIE ? validData.filter(o => o.SERIE === mainObra.SERIE) : [mainObra];

        expandedView.innerHTML = '';
        fichaCol.innerHTML = '';
        expandedLayer.scrollTop = 0;
        
        // Navegação Interna
        const header = document.createElement('div');
        header.className = 'expanded-nav';
        
        const prevBtn = document.createElement('button');
        prevBtn.innerHTML = `<svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        if (groupIndex > 0) {
            prevBtn.addEventListener('click', () => openGallery(gridWorks[groupIndex - 1].ID));
        } else {
            prevBtn.style.opacity = '0.3';
            prevBtn.style.cursor = 'default';
        }

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M3 3h4v4H3zm7 0h4v4h-4zm7 0h4v4h-4zM3 10h4v4H3zm7 0h4v4h-4zm7 0h4v4h-4zM3 17h4v4H3zm7 0h4v4h-4zm7 0h4v4h-4z" fill="currentColor"/></svg>`;
        closeBtn.addEventListener('click', closeGallery);

        const nextBtn = document.createElement('button');
        nextBtn.innerHTML = `<svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        if (groupIndex < gridWorks.length - 1) {
            nextBtn.addEventListener('click', () => openGallery(gridWorks[groupIndex + 1].ID));
        } else {
            nextBtn.style.opacity = '0.3';
            nextBtn.style.cursor = 'default';
        }

        header.appendChild(prevBtn);
        header.appendChild(closeBtn);
        header.appendChild(nextBtn);
        fichaCol.appendChild(header);

        if (id === '25-bstv-') {
            window.initBSTV(fichaCol, expandedView, prevBtn, closeBtn, nextBtn, groupIndex, gridWorks, closeGallery, openGallery);
            
            // Dispara transição
            gridLayer.classList.add('slide-right');
            expandedLayer.classList.add('active');
            return;
        }

        // Container Mídias
        const mediaContainer = document.createElement('div');
        mediaContainer.className = 'expanded-media-container';

        const ref = mainObra;
        const playerObra = serieObras.find(o => o.PLAYER && String(o.PLAYER).trim() !== "") || mainObra; 
        const hasPlayer = playerObra && playerObra.PLAYER && String(playerObra.PLAYER).trim() !== "";

        if (hasPlayer) {
            const playerUrl = String(playerObra.PLAYER).trim();
            const rawRatio = (playerObra.RATIO && String(playerObra.RATIO).trim() !== "")
                ? String(playerObra.RATIO).trim()
                : (mainObra.RATIO && String(mainObra.RATIO).trim() !== ""
                    ? String(mainObra.RATIO).trim()
                    : (serieObras.find(o => o.RATIO && String(o.RATIO).trim() !== "")
                        ? String(serieObras.find(o => o.RATIO && String(o.RATIO).trim() !== "").RATIO).trim()
                        : ""));
            const ratioFormatado = rawRatio ? rawRatio.replace(':', '/').replace('x', '/').replace(/\s+/g, '') : '16/9';
            let embedUrl = '';

            if (playerUrl.includes('vimeo.com')) {
                const vimeoMatch = playerUrl.match(/vimeo\.com\/(?:video\/)?(\d+)/) || playerUrl.match(/\d+/);
                if (vimeoMatch) {
                    const vimeoID = vimeoMatch[1] || vimeoMatch[0];
                    embedUrl = `https://player.vimeo.com/video/${vimeoID}?title=0&byline=0&portrait=0`;
                }
            } else if (playerUrl.includes('youtube.com') || playerUrl.includes('youtu.be')) {
                const ytMatch = playerUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/) || playerUrl.match(/[\w-]{11}/);
                if (ytMatch) {
                    const ytID = ytMatch[1] || ytMatch[0];
                    embedUrl = `https://www.youtube.com/embed/${ytID}?autoplay=0&modestbranding=1&rel=0&showinfo=0&controls=1`;
                }
            }

            if (embedUrl) {
                const iframe = document.createElement('iframe');
                iframe.className = 'video-embed';
                const parts = rawRatio.split(/[:x/]/);
                let numRatio = 16 / 9;
                if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]) && Number(parts[1]) !== 0) {
                    numRatio = Number(parts[0]) / Number(parts[1]);
                }
                iframe.style.setProperty('--v-ratio', String(numRatio));
                iframe.style.aspectRatio = ratioFormatado;
                iframe.src = embedUrl;
                iframe.setAttribute('frameborder', '0');
                iframe.setAttribute('allow', 'fullscreen');
                iframe.setAttribute('allowfullscreen', '');
                mediaContainer.appendChild(iframe);
            }
        }

        serieObras.forEach((o) => {
            const count = parseInt(o.IMG_COUNT) || 1;
            let workMediaList = [];

            const isMidiaVideo = (o.MIDIA && o.MIDIA.length > 2);
            if (hasPlayer && isMidiaVideo) {
                // skip
            } else if (isMidiaVideo) {
                const video = document.createElement('video');
                video.src = `${MIDIA_BASE}${o.ID}a.${o.MIDIA}`;
                video.autoplay = true;
                video.loop = true;
                video.muted = true;
                video.playsInline = true;
                if (o.RATIO) {
                    const vRawRatio = String(o.RATIO).trim();
                    const vParts = vRawRatio.split(/[:x/]/);
                    if (vParts.length === 2 && !isNaN(vParts[0]) && !isNaN(vParts[1]) && Number(vParts[1]) !== 0) {
                        const vNumRatio = Number(vParts[0]) / Number(vParts[1]);
                        video.style.setProperty('--v-ratio', String(vNumRatio));
                        video.style.aspectRatio = vRawRatio.replace(':', '/');
                    }
                }
                workMediaList.push(video);
            } else {
                const img = document.createElement('img');
                img.src = `${THUMB_BASE}${o.ID}a.avif`;
                workMediaList.push(img);
            }

            const letters = ['b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p'];
            for (let j = 0; j < count - 1; j++) {
                const img = document.createElement('img');
                img.src = `${THUMB_BASE}${o.ID}${letters[j]}.avif`;
                workMediaList.push(img);
            }

            if (hasPlayer) workMediaList.reverse();
            
            workMediaList.forEach(el => mediaContainer.appendChild(el));
        });
        
        expandedView.appendChild(mediaContainer);

        // Ficha Técnica
        const ficha = document.createElement('div');
        ficha.className = 'ficha-tecnica';
        
        const fichaMeta = document.createElement('div');
        fichaMeta.className = 'ficha-meta';

        const titleYear = document.createElement('p');
        titleYear.innerHTML = `<strong>${ref.TITULO}</strong>, ${ref.ANO}`;
        fichaMeta.appendChild(titleYear);
        
        const tecnicas = [...new Set(serieObras.map(i => i.TECNICA).filter(Boolean))].join(' / ');
        const dimensoes = [...new Set(serieObras.map(i => i.DIMENSAO).filter(Boolean))].join(' / ');
        if (tecnicas || dimensoes) {
            const techDim = document.createElement('p');
            techDim.textContent = [tecnicas, dimensoes].filter(Boolean).join('. ') + '.';
            fichaMeta.appendChild(techDim);
        }

        const parcerias = [...new Set(serieObras.map(i => i.PARCERIA).filter(Boolean))].join(' / ');
        const creditos = [...new Set(serieObras.map(i => i.CREDITOS).filter(Boolean))].join(' / ');
        if (parcerias || creditos) {
            const extra = document.createElement('p');
            const extras = [];
            if (parcerias) extras.push(`Parceria: ${parcerias}`);
            if (creditos) extras.push(`Créditos: ${creditos}`);
            extra.textContent = extras.join(' / ');
            fichaMeta.appendChild(extra);
        }

        ficha.appendChild(fichaMeta);

        // Bloco SOBRE (Sobreposição)
        const sobreTexts = serieObras.map(i => i.SOBRE).filter(Boolean);
        if (sobreTexts.length > 0) {
            const sobreContent = document.createElement('div');
            sobreContent.className = 'sobre-text';
            sobreContent.innerHTML = sobreTexts.join('<br><br>');
            ficha.appendChild(sobreContent);
        }

        fichaCol.appendChild(ficha);

        // Dispara transição
        gridLayer.classList.add('slide-right');
        expandedLayer.classList.add('active');
    }

    function closeGallery() {
        expandedLayer.classList.remove('active');
        gridLayer.classList.remove('slide-right');
        
        setTimeout(() => {
            if (!expandedLayer.classList.contains('active')) {
                expandedView.innerHTML = '';
                fichaCol.innerHTML = '';
            }
        }, 600);
    }
});

// ============================================================================
// BETSHOPTV (25-bstv-) SPECIFIC LOGIC
// ============================================================================

let bstvAllPecas = [];
let bstvDisplayList = [];
let bstvActiveGroup = null;
let bstvCurrentSort = 'random';
let bstvCurrentPieceId = null;
let bstvEvaRendered = false;

window.initBSTV = function(fichaCol, carouselCol, prevBtn, closeBtn, nextBtn, groupIndex, gridWorks, closeGallery, openGallery) {
    // 1. Build Ficha Técnica (Sidebar) specific for BSTV
    const sidebar = document.createElement('div');
    sidebar.style.display = 'flex';
    sidebar.style.flexDirection = 'column';
    sidebar.style.flex = '1';
    sidebar.style.minHeight = '0';
    sidebar.innerHTML = `
        <div class="accordion-item" id="bstv-acc-eva" style="border-bottom: 2px solid #182420; flex-shrink: 0;">
            <button class="accordion-header" id="bstv-btn-acc-eva" style="width: 100%; border: none; background: transparent; padding: 1rem 1.5rem; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-family: inherit; font-size: 0.875rem; color: #182420;">
                EVA TV Man
                <span class="acc-icon" id="bstv-icon-acc-eva">\\/</span>
            </button>
            <div class="accordion-content" id="bstv-content-eva" style="display: none; padding: 0; direction: rtl;">
                <div style="direction: ltr; padding: 1rem 1.5rem; padding-left: 1.5rem; padding-right: 0.5rem; font-size: 0.875rem; line-height: 1.4; background-color: #182420; color: #888888;">
                    <p style="margin: 0 0 0.5rem 0;"><strong>EVA TV Man</strong>, 2025</p>
                    <p style="margin: 0 0 0.5rem 0;">Página da revista Playboy brasileira contendo reprodução da serigrafia TV Man, de Keith Haring, transferida para refugo de EVA, tinta acrílica, ferragens e ímãs</p>
                    <p style="margin: 0;">60 x 40 x 15 cm</p>
                </div>
            </div>
        </div>

        <div class="accordion-item" id="bstv-acc-chop" style="border-bottom: 2px solid #182420; flex: initial; display: block; flex-direction: column; overflow: hidden; min-height: 0;">
            <button class="accordion-header" id="bstv-btn-acc-chop" style="width: 100%; border: none; background: transparent; padding: 1rem 1.5rem; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-family: inherit; font-size: 0.875rem; color: #182420;">
                Chop Shop AV
                <span class="acc-icon" id="bstv-icon-acc-chop">\\/</span>
            </button>
            <div class="accordion-content" id="bstv-content-chop" style="display: none; flex-direction: column; flex: 1; padding: 0; overflow: hidden !important; min-height: 0;">
                
                <div id="bstv-chop-info" style="padding: 1rem 1.5rem; font-size: 0.875rem; line-height: 1.4; flex-shrink: 0; background-color: #182420; color: #888888;">
                    <p style="margin: 0 0 0.5rem 0;"><strong>Chop Shop AV</strong>, 2025</p>
                    <p style="margin: 0 0 0.5rem 0;">Páginas da revista Playboy brasileira publicadas entre fevereiro e agosto de 1990 transferidas para EVA</p>
                    <p style="margin: 0;">Políptico, dimensões variáveis</p>
                </div>

                <div id="bstv-left-ficha-tecnica" class="bstv-left-ficha" style="display: none; background-color: #182420; color: #888888; padding: 1rem 1.5rem; margin-bottom: 0; flex-shrink: 0;"></div>

                <div class="accordion-item" id="bstv-acc-filtrar-acervo" style="border-top: 2px solid #182420; border-bottom: 2px solid #182420; flex-shrink: 0;">
                    <button class="accordion-header" id="bstv-btn-acc-filtrar" style="width: 100%; border: none; background: transparent; padding: 1rem 1.5rem; cursor: pointer; display: flex; justify-content: space-between; align-items: center; text-transform: uppercase; font-family: inherit; font-size: 0.875rem; color: #182420;">
                        FILTRAR PEÇAS
                        <span class="acc-icon" id="bstv-icon-acc-filtrar">\\/</span>
                    </button>
                    <div class="accordion-content" id="bstv-content-filtrar" style="display: none; padding: 0; direction: rtl;">
                        <div style="direction: ltr; padding: 0 0.5rem 1rem 1.5rem;">
                            <div class="bstv-filters" id="bstv-filters" style="margin-bottom: 0; display: flex; flex-direction: column; gap: 10px;">
                                <div class="filters-group" style="display: flex; flex-direction: row; align-items: center; gap: 8px;">
                                    <span class="filters-label" style="width: 65px; flex-shrink: 0;">ORDEM</span>
                                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; flex: 1;">
                                        <button class="chip" id="bstv-btn-sort-asc" title="Crescente" style="padding: 0; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; font-family: inherit;">↑</button>
                                        <button class="chip" id="bstv-btn-sort-desc" title="Decrescente" style="padding: 0; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; font-family: inherit;">↓</button>
                                        <button class="chip is-active" id="bstv-btn-shuffle" title="Aleatória" style="padding: 0; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem;">↻</button>
                                    </div>
                                </div>
                                <div class="filters-group" style="display: flex; flex-direction: row; align-items: flex-start; gap: 8px;">
                                    <span class="filters-label" style="width: 65px; flex-shrink: 0; margin-top: 6px;">GRUPOS</span>
                                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; flex: 1;">
                                        <button class="chip is-active" id="bstv-btn-group-all" style="grid-column: span 2; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center;">TODOS</button>
                                        <button class="chip bstv-group-btn" data-group="02" style="grid-column: span 1; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center;">02</button>
                                        <button class="chip bstv-group-btn" data-group="03" style="grid-column: span 1; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center;">03</button>
                                        <button class="chip bstv-group-btn" data-group="04" style="grid-column: span 1; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center;">04</button>
                                        <button class="chip bstv-group-btn" data-group="05" style="grid-column: span 1; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center;">05</button>
                                        <button class="chip bstv-group-btn" data-group="06" style="grid-column: span 1; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center;">06</button>
                                        <button class="chip bstv-group-btn" data-group="07" style="grid-column: span 1; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center;">07</button>
                                        <button class="chip bstv-group-btn" data-group="08" style="grid-column: span 1; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center;">08</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="sobre-text" style="flex: 1; overflow-y: auto; padding: 0; direction: rtl;">
                    <div id="bstv-titles-list" style="direction: ltr; padding: 1rem 1.5rem; padding-left: 1.5rem; padding-right: 0.5rem; display: flex; flex-direction: column;"></div>
                </div>
            </div>
        </div>
    `;
    fichaCol.appendChild(sidebar);

    // 2. Build Carousel specifically for BSTV
    const carouselContainer = document.createElement('div');
    carouselContainer.style.display = 'flex';
    carouselContainer.style.flexDirection = 'column';
    carouselContainer.style.height = '100%';
    carouselContainer.style.width = '100%';
    carouselContainer.innerHTML = `
        <div id="bstv-grid-view" class="grid-layer" style="display: none; height: 100%; overflow-y: auto; padding: 1.5rem;">
            <div class="bstv-grid-view" id="bstv-grid-container"></div>
        </div>
        <div id="bstv-feed-view" class="expanded-view" style="display: none; height: 100%;">
            <div class="expanded-media-container" id="bstv-feed-media-container" style="display:flex; flex-direction:row;"></div>
        </div>
        <div id="bstv-eva-feed-view" class="expanded-view" style="display: none; height: 100%;">
            <div class="expanded-media-container" id="bstv-eva-media-container" style="display:flex; flex-direction:row;"></div>
        </div>
    `;
    carouselCol.appendChild(carouselContainer);

    // Setup Listeners for BSTV interactions
    document.getElementById('bstv-btn-acc-eva').onclick = () => window.toggleBSTVWorkView('eva');
    document.getElementById('bstv-btn-acc-chop').onclick = () => window.toggleBSTVWorkView('chop');
    
    document.getElementById('bstv-btn-acc-filtrar').onclick = () => {
        const c = document.getElementById('bstv-content-filtrar');
        const i = document.getElementById('bstv-icon-acc-filtrar');
        const isOpen = c.style.display !== 'none';
        c.style.display = isOpen ? 'none' : 'block';
        i.textContent = isOpen ? '\\/' : '/\\';
    };

    document.getElementById('bstv-btn-sort-asc').onclick = () => { if (!bstvCurrentPieceId) { bstvCurrentSort = 'asc'; window.applyBSTVFilters(); } };
    document.getElementById('bstv-btn-sort-desc').onclick = () => { if (!bstvCurrentPieceId) { bstvCurrentSort = 'desc'; window.applyBSTVFilters(); } };
    document.getElementById('bstv-btn-shuffle').onclick = () => { 
        if (bstvCurrentPieceId) return;
        bstvCurrentSort = 'random';
        if (bstvActiveGroup) { window.bstvShuffleArray(bstvDisplayList); window.renderBSTVAll(); }
        else { window.bstvShuffleArray(bstvAllPecas); window.applyBSTVFilters(); }
    };

    document.getElementById('bstv-btn-group-all').onclick = () => window.toggleBSTVGroup(null);
    document.querySelectorAll('.bstv-group-btn').forEach(btn => {
        btn.onclick = (e) => window.toggleBSTVGroup(e.target.dataset.group);
    });

    // Integrated Navigation handling
    window.updateBSTVNavIcons = () => {
        if (bstvCurrentPieceId) {
            const idx = bstvDisplayList.findIndex(p => p.id_peca === bstvCurrentPieceId);
            prevBtn.style.opacity = idx > 0 ? '1' : '0.2';
            prevBtn.style.cursor = idx > 0 ? 'pointer' : 'default';
            nextBtn.style.opacity = (idx >= 0 && idx < bstvDisplayList.length - 1) ? '1' : '0.2';
            nextBtn.style.cursor = (idx >= 0 && idx < bstvDisplayList.length - 1) ? 'pointer' : 'default';
        } else {
            prevBtn.style.opacity = groupIndex > 0 ? '1' : '0.2';
            prevBtn.style.cursor = groupIndex > 0 ? 'pointer' : 'default';
            nextBtn.style.opacity = groupIndex < gridWorks.length - 1 ? '1' : '0.2';
            nextBtn.style.cursor = groupIndex < gridWorks.length - 1 ? 'pointer' : 'default';
        }
    };

    prevBtn.onclick = () => {
        if (bstvCurrentPieceId) {
            const idx = bstvDisplayList.findIndex(p => p.id_peca === bstvCurrentPieceId);
            if (idx > 0) window.setBSTVPiece(bstvDisplayList[idx - 1].id_peca);
        } else {
            if (groupIndex > 0) openGallery(gridWorks[groupIndex - 1].ID);
        }
    };

    nextBtn.onclick = () => {
        if (bstvCurrentPieceId) {
            const idx = bstvDisplayList.findIndex(p => p.id_peca === bstvCurrentPieceId);
            if (idx >= 0 && idx < bstvDisplayList.length - 1) window.setBSTVPiece(bstvDisplayList[idx + 1].id_peca);
        } else {
            if (groupIndex < gridWorks.length - 1) openGallery(gridWorks[groupIndex + 1].ID);
        }
    };

    closeBtn.onclick = () => {
        if (bstvCurrentPieceId) {
            window.setBSTVPiece(null);
        } else {
            closeGallery();
        }
    };

    window.updateBSTVNavIcons();
    window.loadBSTVData();
};

window.bstvShuffleArray = function(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
};

window.loadBSTVData = async function() {
    if (bstvAllPecas.length > 0) {
        window.applyBSTVFilters();
        return;
    }
    try {
        const res = await fetch('https://betshoptv.github.io/dados/pecas.json');
        const data = await res.json();
        bstvAllPecas = data.filter(p => p.imagens && p.imagens.length > 0);
        window.bstvShuffleArray(bstvAllPecas);
        window.applyBSTVFilters();
    } catch(e) { console.error("Erro ao carregar dados BSTV:", e); }
};

window.toggleBSTVWorkView = function(work) {
    const accEva = document.getElementById('bstv-acc-eva');
    const contentEva = document.getElementById('bstv-content-eva');
    const iconEva = document.getElementById('bstv-icon-acc-eva');
    
    const accChop = document.getElementById('bstv-acc-chop');
    const contentChop = document.getElementById('bstv-content-chop');
    const iconChop = document.getElementById('bstv-icon-acc-chop');

    if (work === 'eva') {
        if (accEva.classList.contains('active')) {
            accEva.classList.remove('active');
            contentEva.style.display = 'none';
            iconEva.textContent = '\\/';
            document.getElementById('bstv-eva-feed-view').style.display = 'none';
        } else {
            accEva.classList.add('active');
            contentEva.style.display = 'block';
            iconEva.textContent = '/\\';
            
            accChop.classList.remove('active');
            accChop.style.flex = 'initial';
            contentChop.style.display = 'none';
            iconChop.textContent = '\\/';
            
            document.getElementById('bstv-grid-view').style.display = 'none';
            document.getElementById('bstv-feed-view').style.display = 'none';
            document.getElementById('bstv-eva-feed-view').style.display = 'flex';
            window.renderBSTVEvaImages();
        }
    } else if (work === 'chop') {
        if (accChop.classList.contains('active')) {
            if (bstvCurrentPieceId) {
                bstvCurrentPieceId = null;
                bstvActiveGroup = null;
                bstvCurrentSort = 'random';
                window.applyBSTVFilters();
                document.getElementById('bstv-grid-view').style.display = 'block';
                document.getElementById('bstv-feed-view').style.display = 'none';
                window.updateBSTVNavIcons();
            } else {
                accChop.classList.remove('active');
                accChop.style.flex = 'initial';
                contentChop.style.display = 'none';
                iconChop.textContent = '\\/';
                document.getElementById('bstv-grid-view').style.display = 'none';
            }
        } else {
            accChop.classList.add('active');
            accChop.style.flex = '1';
            contentChop.style.display = 'flex';
            iconChop.textContent = '/\\';
            
            accEva.classList.remove('active');
            contentEva.style.display = 'none';
            iconEva.textContent = '\\/';
            
            bstvCurrentPieceId = null;
            bstvActiveGroup = null;
            bstvCurrentSort = 'random';
            window.applyBSTVFilters();
            
            document.getElementById('bstv-eva-feed-view').style.display = 'none';
            document.getElementById('bstv-grid-view').style.display = 'block';
            document.getElementById('bstv-feed-view').style.display = 'none';
            window.updateBSTVNavIcons();
        }
    }
};

window.renderBSTVEvaImages = function() {
    if (bstvEvaRendered) return;
    const c = document.getElementById('bstv-eva-media-container');
    c.innerHTML = '';
    ['ETM_001.jpg', 'ETM_002.jpg', 'ETM_003.jpg', 'ETM_004.jpg', 'ETM_005.jpg', 'ETM_006.jpg'].forEach(imgName => {
        const img = document.createElement('img');
        img.src = `https://betshoptv.github.io/galeria/${imgName}`;
        img.loading = 'lazy';
        img.alt = 'EVA TV Man';
        c.appendChild(img);
    });
    bstvEvaRendered = true;
};

window.toggleBSTVGroup = function(group) {
    if (bstvCurrentPieceId !== null) {
        bstvCurrentPieceId = null;
        if (bstvActiveGroup === group) {
            window.applyBSTVFilters();
            return;
        }
    }
    
    if (group === null || bstvActiveGroup === group) {
        bstvActiveGroup = null;
        bstvCurrentSort = 'random';
    } else {
        bstvActiveGroup = group;
        bstvCurrentSort = 'asc';
    }
    
    document.getElementById('bstv-btn-group-all').classList.toggle('is-active', bstvActiveGroup === null);
    document.querySelectorAll('.bstv-group-btn').forEach(btn => {
        btn.classList.toggle('is-active', btn.dataset.group === bstvActiveGroup);
    });
    
    window.applyBSTVFilters();
};

window.applyBSTVFilters = function() {
    document.getElementById('bstv-btn-sort-asc').classList.toggle('is-active', bstvCurrentSort === 'asc');
    document.getElementById('bstv-btn-sort-desc').classList.toggle('is-active', bstvCurrentSort === 'desc');
    document.getElementById('bstv-btn-shuffle').classList.toggle('is-active', bstvCurrentSort === 'random');
    
    if (bstvActiveGroup) {
        bstvDisplayList = bstvAllPecas.filter(p => String(p.id_peca).startsWith(bstvActiveGroup));
    } else {
        bstvDisplayList = [...bstvAllPecas];
    }
    
    if (bstvCurrentSort !== 'random') {
        const groupKey = p => parseInt(String(p.id_peca).slice(0, 2)) || 0;
        const numKey = p => parseInt(p.id_peca) || 0;
        if (bstvCurrentSort === 'asc') bstvDisplayList.sort((a, b) => (groupKey(a) - groupKey(b)) || (numKey(a) - numKey(b)));
        else if (bstvCurrentSort === 'desc') bstvDisplayList.sort((a, b) => (groupKey(b) - groupKey(a)) || (numKey(b) - numKey(a)));
    }
    
    window.renderBSTVAll();
};

window.setBSTVPiece = function(id) {
    bstvCurrentPieceId = id;
    window.renderBSTVAll();
};

window.renderBSTVAll = function() {
    const titlesList = document.getElementById('bstv-titles-list');
    titlesList.innerHTML = '';
    const sortedTitles = [...bstvDisplayList].sort((a, b) => (parseInt(a.id_peca)||0) - (parseInt(b.id_peca)||0));
    
    sortedTitles.forEach(p => {
        const item = document.createElement('div');
        item.className = 'list-item';
        if (p.id_peca === bstvCurrentPieceId) item.classList.add('active');
        item.textContent = p.titulo || `Peça ${p.id_peca}`;
        item.onclick = () => window.setBSTVPiece(p.id_peca);
        titlesList.appendChild(item);
    });
    
    window.updateBSTVNavIcons();
    
    if (bstvCurrentPieceId) {
        document.getElementById('bstv-grid-view').style.display = 'none';
        document.getElementById('bstv-feed-view').style.display = 'flex';
        document.getElementById('bstv-left-ficha-tecnica').style.display = 'flex';
        document.getElementById('bstv-chop-info').style.display = 'none';
        
        const p = bstvAllPecas.find(x => x.id_peca === bstvCurrentPieceId);
        if (p) {
            const feed = document.getElementById('bstv-feed-media-container');
            feed.innerHTML = '';
            p.imagens.forEach(imgName => {
                const img = document.createElement('img');
                img.src = `https://betshoptv.github.io/img/otm/${imgName}.avif`;
                img.onerror = () => { if (img.src.endsWith('.avif')) img.src = img.src.replace('.avif', '.jpg'); };
                feed.appendChild(img);
            });
            document.getElementById('bstv-left-ficha-tecnica').innerHTML = `
                <p style="margin: 0 0 0.5rem 0;"><strong>${p.titulo || `Peça ${p.id_peca}`}</strong>, 2025</p>
                <p style="margin: 0 0 0.5rem 0;">${p.tecnica || ''}</p>
                <p style="margin: 0;">${p.dimensao || ''}</p>
            `;
            feed.scrollLeft = 0;
        }
    } else {
        document.getElementById('bstv-grid-view').style.display = 'block';
        document.getElementById('bstv-feed-view').style.display = 'none';
        document.getElementById('bstv-left-ficha-tecnica').style.display = 'none';
        document.getElementById('bstv-chop-info').style.display = 'block';
        
        const grid = document.getElementById('bstv-grid-view');
        grid.scrollTop = 0;
        const gridContainer = document.getElementById('bstv-grid-container');
        gridContainer.innerHTML = '';
        
        const cols = [];
        for (let i = 0; i < 3; i++) {
            const col = document.createElement('div');
            col.className = 'bstv-grid-column';
            gridContainer.appendChild(col);
            cols.push(col);
        }

        bstvDisplayList.forEach((p, index) => {
            const thumb = document.createElement('div');
            thumb.className = 'bstv-thumb-wrapper';
            const img = document.createElement('img');
            img.src = `https://betshoptv.github.io/img/tmb/${p.imagens[0]}.avif`;
            img.onerror = () => { if (img.src.endsWith('.avif')) img.src = img.src.replace('.avif', '.jpg'); };
            img.alt = p.titulo;
            thumb.appendChild(img);
            thumb.onclick = () => window.setBSTVPiece(p.id_peca);
            cols[index % 3].appendChild(thumb);
        });
    }
};
