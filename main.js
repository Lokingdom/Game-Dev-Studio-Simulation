import { t, updateDOM } from './i18n.js';
import { GAME_STATE, CONSTANTS, STUDIO_LEVELS_CONFIG } from './data.js';
import { startGameLoop, saveGame, loadGame } from './gameLogic.js';

let DOM = {};

function initDOM() {
    DOM = {
        'studio-name': document.getElementById('studio-name'),
        'money': document.getElementById('money'),
        'level': document.getElementById('level'),
        'xp-top': document.getElementById('xp-top'),
        'studio-level-name': document.getElementById('studio-level-name'),
        'btn-upgrade-studio': document.getElementById('btn-upgrade-studio'),
        'studio-progress': document.getElementById('studio-progress'),
        'studio-upgrade-price-container': document.getElementById('studio-upgrade-price-container'),
        'studio-next-benefits': document.getElementById('studio-next-benefits'),
        'studio-price': document.getElementById('studio-price'),
        'moteur-name-display': document.getElementById('moteur-name-display'),
        'perso-level': document.getElementById('perso-level'),
        'perso-progress': document.getElementById('perso-progress'),
        'perso-price': document.getElementById('perso-price'),
        'moteur-level': document.getElementById('moteur-level'),
        'moteur-progress': document.getElementById('moteur-progress'),
        'moteur-price': document.getElementById('moteur-price'),
        'btn-upgrade-perso': document.getElementById('btn-upgrade-perso'),
        'btn-upgrade-moteur': document.getElementById('btn-upgrade-moteur'),
    };
}

export function updateUI() { 
    try {
        updateDOM();
        populateDropdowns();

        let bgLevel = Math.min(GAME_STATE.niveauStudio || 1, 5);
        const expectedFilename = "assets/bg_level" + bgLevel + "_v4.png";
        const currentBg = document.body.style.backgroundImage || "";
        if (!currentBg.includes(expectedFilename)) {
            const bgUrl = "url('" + expectedFilename + "')";
            document.body.style.backgroundImage = bgUrl;
        }

        if (typeof DOM === 'undefined' || !DOM['studio-name']) return;
        
        DOM['studio-name'].textContent = GAME_STATE.nomStudio || CONSTANTS.NOM_DU_STUDIO_PAR_DEFAUT;
        if (DOM['moteur-name-display']) {
            DOM['moteur-name-display'].textContent = GAME_STATE.nomMoteur || "Moteur";
        }

        DOM['money'].textContent = Math.floor(GAME_STATE.argent).toLocaleString();
        DOM['level'].textContent = GAME_STATE.niveauStudio;
        if (DOM['xp-top']) DOM['xp-top'].textContent = GAME_STATE.pointsRecherche || 0;

        if (DOM['studio-level-name']) {
            const lvlCfg = STUDIO_LEVELS_CONFIG[GAME_STATE.niveauStudio || 1];
            if (lvlCfg) {
                DOM['studio-level-name'].textContent = t(lvlCfg.nom) + " (" + t("Niv.") + " " + (GAME_STATE.niveauStudio || 1) + ")";
            }
        }
    } catch(e) { 
        console.error('updateUI error:', e); 
    }
}

function populateDropdowns() {
    // Placeholder
}

export function addEventLog(msg) {
    console.log(msg);
}

window.addEventListener('DOMContentLoaded', function() {
    initDOM();
    loadGame();
    updateUI();
    startGameLoop();
});