import { GAME_STATE } from './data.js';

export const TRANSLATIONS = {
    "Studio AAAA": "AAAA Studio",
    "Studio AAA": "AAA Studio",
    "Studio AA": "AA Studio",
    "Petit studio Indé": "Small Indie Studio",
    "Studio Indé": "Indie Studio",
    "Niv.": "Lvl.",
    "Note :": "Score:",
    "Difficulté :": "Difficulty:",
    "Nom :": "Name:",
    "Retour à la création de jeu": "Back to game creation",
    "Mon Super Studio": "My Awesome Studio",
    "Moteur": "Engine",
    "Paramètres": "Settings",
    "Sauvegarder": "Save",
    "Studio": "Studio",
    "Personnages": "Characters",
    "Jeux en vente": "Games on Sale",
    "Historique": "History",
    "Recherches": "Research",
    "Améliorer le Studio": "Upgrade Studio",
    "Niveau Maximum": "Max Level",
    "Niveau ": "Level ",
    "Prix : ": "Price: ",
    "Créer un nouveau jeu": "Create a new game",
    "Développement en cours": "Development in progress",
    "Progression du développement": "Development progress",
    "Jeux en cours de vente": "Games currently on sale",
    "Aucun jeu terminé.": "No game completed yet.",
    "Amélioration en cours...": "Upgrading...",
    "Vous avez atteint le niveau maximum de studio !": "You have reached the maximum studio level!",
    "Avantages du niveau suivant": "Next level benefits",
    "← Retour": "← Back",
    "JEU TERMINÉ !": "GAME COMPLETED!",
    "Note du jeu": "Game Score",
    "Jeux sortis": "Released games",
    "Débloque la taille 'Indé' et les mécaniques de base.": "Unlocks 'Indie' size and basic mechanics."
};

export function setLanguage(lang) {
    if (!GAME_STATE) return;
    GAME_STATE.language = lang;
    updateDOM();
}

export function getLanguage() {
    return GAME_STATE?.language || 'fr';
}

export function t(frText) {
    if (getLanguage() === 'en' && TRANSLATIONS[frText]) {
        return TRANSLATIONS[frText];
    }
    return frText;
}

export function updateDOM() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (el.tagName === 'INPUT' && (el.type === 'button' || el.type === 'submit')) {
            el.value = t(key);
        } else {
            el.innerHTML = t(key);
        }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = t(key);
    });
}