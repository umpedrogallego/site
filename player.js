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
                width: 100%;
                background: #000;
                --bg: #ecece9;
                --meta: #948a8d;
                --ui-font: 'Supreme', sans-serif;
            }
            .wrapper {
                position: relative;
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
                cursor: pointer;
                font-family: var(--ui-font);
            }
            video { width: 100%; height: auto; display: block; }
            
            /* Big Play Overlay */
            .big-play {
                position: absolute; z-index: 10;
                transition: opacity 0.3s ease;
                pointer-events: none;
            }
            .big-play.hidden { opacity: 0; }
            .big-play svg { width: 80px; height: 80px; fill: var(--bg); filter: drop-shadow(0 0 15px rgba(0,0,0,0.4)); }

            /* Controls Bar */
            .controls {
                position: absolute; bottom: 0; width: 100%;
                background: linear-gradient(0deg, rgba(0,0,0,0.9) 0%, transparent 100%);
                display: flex; align-items: center;
                padding: 20px; gap: 15px; box-sizing: border-box;
                z-index: 11;
                opacity: 0; transform: translateY(10px);
                transition: opacity 0.24s ease, transform 0.24s ease;
                transition-delay: 2s; /* Delay para sumir no Desktop */
            }
            .wrapper:hover .controls, .controls.visible {
                opacity: 1; transform: translateY(0);
                transition-delay: 0s;
            }

            button { background: none; border: none; padding: 0; cursor: pointer; color: var(--bg); display: flex; align-items: center; }
            svg { width: 20px; height: 20px; fill: currentColor; }

            /* Progress */
            .progress-area { flex-grow: 1; height: 3px; background: rgba(255,255,255,0.2); position: relative; cursor: pointer; }
            .progress-bar { height: 100%; background: var(--bg); width: 0%; pointer-events: none; }

            /* Volume */
            .vol-group { position: relative; display: flex; align-items: center; padding: 0 5px; }
            .vol-slider-con {
                position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%);
                background: rgba(15, 15, 15, 0.95); padding: 15px 10px; border-radius: 4px;
                display: none; height: 100px; backdrop-filter: blur(5px);
            }
            .vol-group:hover .vol-slider-con, .vol-slider-con.active { display: flex; align-items: center; }
            input[type="range"] { writing-mode: bt-lr; appearance: slider-vertical; width: 4px; height: 80px; accent-color: var(--bg); cursor: pointer; }

            .off { color: var(--meta); }
        </style>

        <div class="wrapper" id="W">
            <video id="V" preload="metadata" playsinline poster="${poster}">
                <source src="${src}" type="video/mp4">
            </video>

            <div class="big-play" id="BP">
                <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>

            <div class="controls" id="C">
                <button id="PP" aria-label="Play/Pause"><svg id="ppI" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></button>
                <div class="progress-area" id="PA"><div class="progress-bar" id="PB"></div></div>
                <div class="vol-group">
                    <div class="vol-slider-con" id="VC">
                        <input type="range" id="VS" min="0" max="1" step="0.05" value="1">
                    </div>
                    <button id="M" aria-label="Mute"><svg id="mI" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg></button>
                </div>
                <button id="L" class="off" aria-label="Loop"><svg viewBox="0 0 24 24"><path d="M17 17H7v-3l-4 4 4 4v-3h12v-6h-2v4zM7 7h10v3l4-4-4-4v3H5v6h2V7z"/></svg></button>
                <button id="F" aria-label="Fullscreen"><svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg></button>
            </div>
        </div>
        `;

        this.setupEvents();
    }

    setupEvents() {
        const r = this.shadowRoot;
        const v = r.getElementById('V'), w = r.getElementById('W'), c = r.getElementById('C');
        const ppI = r.getElementById('ppI'), bp = r.getElementById('BP'), pb = r.getElementById('PB');
        const mI = r.getElementById('mI'), vs = r.getElementById('VS'), lBtn = r.getElementById('L');

        const paths = {
            play: 'M8 5v14l11-7z',
            pause: 'M6 19h4V5H6v14zm8-14v14h4V5h-4z',
            vol: 'M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z',
            mute: 'M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z'
        };

        const toggle = () => { if (v.paused) v.play(); else v.pause(); this.showMobileControls(); };

        // Play/Pause
        w.onclick = (e) => { if(e.target === v || e.target === w) toggle(); };
        r.getElementById('PP').onclick = (e) => { e.stopPropagation(); toggle(); };
        
        v.onplay = () => { bp.classList.add('hidden'); ppI.setAttribute('d', paths.pause); };
        v.onpause = () => { bp.classList.remove('hidden'); ppI.setAttribute('d', paths.play); };

        // Progress
        v.ontimeupdate = () => pb.style.width = (v.currentTime / v.duration) * 100 + '%';
        r.getElementById('PA').onclick = (e) => {
            e.stopPropagation();
            v.currentTime = ((e.clientX - e.currentTarget.getBoundingClientRect().left) / e.currentTarget.offsetWidth) * v.duration;
        };

        // Volume logic
        const updateMuteI = () => {
            const isM = v.muted || v.volume === 0;
            r.getElementById('M').classList.toggle('off', isM);
            mI.setAttribute('d', isM ? paths.mute : paths.vol);
        };
        r.getElementById('M').onclick = (e) => { e.stopPropagation(); v.muted = !v.muted; vs.value = v.muted ? 0 : v.volume; updateMuteI(); };
        vs.oninput = (e) => { e.stopPropagation(); v.volume = vs.value; v.muted = vs.value == 0; updateMuteI(); };

        // Loop
        lBtn.onclick = (e) => { e.stopPropagation(); v.loop = !v.loop; lBtn.classList.toggle('off', !v.loop); };

        // Fullscreen
        r.getElementById('F').onclick = (e) => { e.stopPropagation(); if (!document.fullscreenElement) w.requestFullscreen(); else document.exitFullscreen(); };
    }

    showMobileControls() {
        const c = this.shadowRoot.getElementById('C');
        c.classList.add('visible');
        clearTimeout(this.autoHideTimer);
        this.autoHideTimer = setTimeout(() => c.classList.remove('visible'), 3000);
    }
}
customElements.define('devart-player', DevArtPlayer);
