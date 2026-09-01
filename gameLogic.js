import { t } from './i18n.js';
import { CONSTANTS, GAME_STATE, STUDIO_LEVELS_CONFIG } from './data.js';
import { updateUI, addEventLog } from './main.js';

let gameLoopInterval = null;

export function startGameLoop() {
    if (gameLoopInterval) clearInterval(gameLoopInterval);
    gameLoopInterval = setInterval(() => {
        try {
            updateUI();
            saveGame();
        } catch(e) {
            console.error("Game loop error:", e);
        }
    }, 1000);
}

export function saveGame() {
    try {
        const dataToSave = JSON.stringify(GAME_STATE);
        localStorage.setItem(CONSTANTS.SAVE_KEY, dataToSave);
    } catch (error) {
        console.error("Erreur lors de la sauvegarde :", error);
    }
}

export function loadGame() {
    try {
        const savedData = localStorage.getItem(CONSTANTS.SAVE_KEY);
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            for (let key in GAME_STATE) {
                delete GAME_STATE[key];
            }
            Object.assign(GAME_STATE, parsedData);
            return true;
        }
    } catch (error) {
        console.error("Erreur lors du chargement :", error);
    }
    return false;
}