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

            const letters = ['b', 'c', 'd', 'e', 'f', 'g'];
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
