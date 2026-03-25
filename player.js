class DevArtPlayer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.autoHideTimer = null;
    }

    connectedCallback() {
        const src = this.getAttribute('src');
        const poster = this.getAttribute('poster');

        this.shadowRoot.innerHTML = `
        <style>
            :host {
                display: block;
                height: 100%;
                width: auto;
                background: none;
                --bg: #ecece9;
                --meta: #948a8d;
                --ui-font: 'Supreme', sans-serif;
            }
            .wrapper {
                position: relative;
                height: 100%;
                width: auto;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
                cursor: pointer;
                font-family: var(--ui-font);
            }
            video { 
                height: 100%; 
                width: auto; 
                display: block; 
            }
            
            /* UI Controls */
            .controls {
                position: absolute;
                bottom: 0; left: 0; right: 0;
                background: linear-gradient(transparent, rgba(0,0,0,0.6));
                padding: 20px;
                display: flex;
                align-items: center;
                gap: 15px;
                transition: opacity 0.24s ease, transform 0.24s ease;
                z-index: 20;
            }
            .controls.hidden { opacity: 0; transform: translateY(10px); pointer-events: none; }

            .btn {
                background: none; border: none; cursor: pointer;
                display: flex; align-items: center; justify-content: center;
                padding: 0;
                transition: opacity 0.2s;
            }
            .btn svg { width: 22px; height: 22px; fill: var(--bg); }
            .btn:hover { opacity: 0.8; }
            
            /* Estado Desativado (Loop) */
            .btn.off svg { fill: var(--meta); }

            /* Barra de Progresso Superior */
            .progress-area {
                flex: 1;
                height: 3px;
                background: rgba(255,255,255,0.2);
                position: relative;
                cursor: pointer;
            }
            .progress-bar {
                position: absolute; height: 100%;
                background: var(--bg);
                width: 0%;
            }

            /* Volume Vertical */
            .vol-wrapper {
                position: relative;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            .vol-slider-container {
                position: absolute;
                bottom: 40px;
                width: 32px;
                height: 110px;
                background: rgba(0,0,0,0.8);
                display: none;
                align-items: center;
                justify-content: center;
                padding: 10px 0;
                border-radius: 2px;
            }
            .vol-slider-container.active { display: flex; }
            
            input[type=range] {
                -webkit-appearance: none;
                width: 80px;
                height: 2px;
                background: var(--meta);
                transform: rotate(-90deg);
                cursor: pointer;
            }
            input[type=range]::-webkit-slider-thumb {
                -webkit-appearance: none;
                height: 12px; width: 12px;
                background: var(--bg);
                border-radius: 50%;
                cursor: pointer;
            }

            /* Overlay Play Central */
            .big-play {
                position: absolute;
                z-index: 15;
                transition: opacity 0.3s;
                pointer-events: none;
                display: flex;
            }
            .big-play.hidden { opacity: 0; }
            .big-play svg { width: 60px; height: 60px; fill: var(--bg); }

        </style>

        <div class="wrapper" id="W">
            <video id="V" src="${src}" poster="${poster}" playsinline></video>
            
            <div class="big-play" id="BP">
                <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>

            <div class="controls hidden" id="C">
                <button class="btn" id="PP">
                    <svg viewBox="0 0 24 24">
                        <path id="pp-icon" d="M8 5v14l11-7z"/>
                    </svg>
                </button>

                <div class="progress-area" id="PA">
                    <div class="progress-bar" id="PB"></div>
                </div>

                <div class="vol-wrapper">
                    <div class="vol-slider-container" id="VC">
                        <input type="range" id="VS" min="0" max="1" step="0.1" value="1">
                    </div>
                    <button class="btn" id="M">
                        <svg id="vol-svg" viewBox="0 0 24 24"><path id="vol-icon" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                    </button>
                </div>

                <button class="btn off" id="L">
                    <svg viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>
                </button>

                <button class="btn" id="F">
                    <svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
                </button>
            </div>
        </div>
        `;

        this.setupEvents();
    }

    setupEvents() {
        const r = this.shadowRoot;
        const v = r.getElementById('V');
        const w = r.getElementById('W');
        const c = r.getElementById('C');
        const ppPath = r.getElementById('pp-icon'); // Agora pegando o Path
        const bp = r.getElementById('BP');
        const pb = r.getElementById('PB');
        const vc = r.getElementById('VC');
        const vs = r.getElementById('VS');
        const vPath = r.getElementById('vol-icon');
        const lBtn = r.getElementById('L');

        const paths = {
            play: "M8 5v14l11-7z",
            pause: "M6 19h4V5H6v14zm8-14v14h4V5h-4z",
            vol: "M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z",
            mute: "M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"
        };

        const togglePlay = () => {
            if (v.paused) {
                v.play();
                ppPath.setAttribute('d', paths.pause);
                bp.classList.add('hidden');
            } else {
                v.pause();
                ppPath.setAttribute('d', paths.play);
                bp.classList.remove('hidden');
            }
        };

        // Click no vídeo ou botão Play
        w.onclick = (e) => { 
            if(e.target.id !== 'VS' && e.target.id !== 'M' && !e.target.closest('.btn')) togglePlay(); 
        };
        r.getElementById('PP').onclick = (e) => { e.stopPropagation(); togglePlay(); };

        // Auto-hide controls
        const showC = () => {
            c.classList.remove('hidden');
            clearTimeout(this.autoHideTimer);
            this.autoHideTimer = setTimeout(() => {
                if (!v.paused) c.classList.add('hidden');
                vc.classList.remove('active'); 
            }, 3000);
        };

        w.onmousemove = showC;
        w.ontouchstart = showC;

        // Progress
        v.ontimeupdate = () => pb.style.width = (v.currentTime / v.duration) * 100 + '%';
        r.getElementById('PA').onclick = (e) => {
            e.stopPropagation();
            const rect = e.currentTarget.getBoundingClientRect();
            v.currentTime = ((e.clientX - rect.left) / rect.width) * v.duration;
        };

        // Volume logic
        r.getElementById('M').onclick = (e) => {
            e.stopPropagation();
            vc.classList.toggle('active');
        };

        vs.oninput = (e) => {
            e.stopPropagation();
            v.volume = vs.value;
            v.muted = vs.value == 0;
            vPath.setAttribute('d', v.muted ? paths.mute : paths.vol);
            r.getElementById('M').classList.toggle('off', v.muted);
        };

        // Loop - Inicia desligado
        lBtn.onclick = (e) => {
            e.stopPropagation();
            v.loop = !v.loop;
            lBtn.classList.toggle('off', !v.loop);
        };

        // Fullscreen
        r.getElementById('F').onclick = (e) => {
            e.stopPropagation();
            if (!document.fullscreenElement) w.requestFullscreen();
            else document.exitFullscreen();
        };
    }
}
customElements.define('devart-player', DevArtPlayer);
