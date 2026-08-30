

import { setLanguage, getLanguage, t, updateDOM } from './i18n.js';
import { CONSTANTS, GAME_STATE, GENRES_CONFIG, SUJETS_CONFIG, PLATEFORMES_CONFIG, PUBLICITE_CONFIG, EMPLOYES_CONFIG, MAX_NIVEAU_PERSONNAGE, MAX_NIVEAU_MOTEUR, STUDIO_LEVELS_CONFIG } from './data.js';
import { loadGame, saveGame, resetGame, startAutoSave, createGame, calculerPrixAmelioration, calculerVitesseDeveloppement, ameliorerPersonnage, ameliorerMoteurUnique, calculerPrixPersonnage, calculerPrixMoteur, commencerDeveloppement, calculerPrixAmeliorationCaracteristique, acheterCampagnePublicitaire, startGameLoop, recruterEmploye, calculerPrixRecrutement, finishGame , rechercherGenre, rechercherSujet, rechercherPlateforme, ameliorerStudio, getMaxLevelAllowed} from './game.js';

// Cache pour les éléments du DOM pour éviter de refaire getElementById à chaque seconde
const DOM = {};

function initDOMCache() {
    const ids = [
        'studio-name', 'money', 'level', 'xp-top',
                'idle-screen', 'btn-show-create', 'create-game-area', 'active-game-area', 'game-summary-area',
        'center-nav', 'btn-back-center', 'center-title', 'recent-games-list', 'mini-event-log',
        'perso-level', 'perso-progress', 'btn-upgrade-perso', 'perso-price-container', 'perso-price',
        'moteur-level', 'moteur-progress', 'btn-upgrade-moteur', 'moteur-price-container', 'moteur-price',
        'summary-game-name', 'summary-game-genre', 'summary-game-difficulty', 'summary-game-subject', 'summary-game-platform', 'summary-game-size', 'summary-game-score', 'summary-game-revenue', 'summary-game-rep', 'summary-time-left',
        'active-game-name', 'active-game-genre', 'active-game-difficulty', 'active-game-subject', 'active-game-platform', 'active-game-size', 'active-game-title',
        'active-game-preparation', 'active-game-qualites',
        'prep-level-scenario', 'btn-prep-scenario',
        'prep-level-gameplay', 'btn-prep-gameplay',
        'prep-level-graphismes', 'btn-prep-graphismes',
        'prep-level-sons', 'btn-prep-sons',
        'prep-level-dureeVie', 'btn-prep-dureeVie',
        'btn-start-dev',
        'active-game-scenario', 'active-game-gameplay', 'active-game-graphisme', 'active-game-son', 'active-game-longevite',
        'active-game-progress-bar', 'active-game-score-container', 'active-game-revenue-container', 'active-game-total-revenue-container',
        'active-game-progress-label', 'active-game-progress-text', 'active-game-score', 'active-game-revenue', 'active-game-total-revenue',
        'stat-jeux-crees', 'stat-argent-total', 'stat-meilleure-note', 'stat-meilleur-jeu',
        'recherche-points', 'recherche-genres-list', 'recherche-sujets-list', 'recherche-plateformes-list',
        'games-history-list', 'event-log',
        'game-genre', 'game-subject',
        'game-hype', 'btn-pub-petite', 'btn-pub-moyenne', 'btn-pub-grande', 'btn-pub-mondiale',
        'welcome-modal', 'btn-start-adventure', 'startup-studio-name', 'startup-engine-name', 'moteur-name-display',
        'btn-settings', 'settings-modal', 'btn-close-settings', 'settings-studio-name', 'btn-save-studio-name', 'btn-save-language', 'settings-language', 'settings-engine-name', 'btn-save-engine-name', 'btn-reset-modal',
        'reset-confirm-modal', 'btn-cancel-reset', 'btn-confirm-reset',
        'btn-save-game', 'btn-reset', 'btn-create-game', 'btn-upgrade-studio', 'studio-progress', 'studio-price', 'studio-next-benefits', 'studio-upgrade-price-container', 'studio-level-name'
    ];
    
    ids.forEach(id => {
        DOM[id] = document.getElementById(id);
    });
}


function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = e.target.getAttribute('data-target');
            const parentCol = e.target.closest('.column, .modal-body');
            
            parentCol.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            parentCol.querySelectorAll('.tab-pane').forEach(p => {
                if (p.id === targetId) {
                    p.style.display = 'block';
                    p.classList.add('active');
                } else {
                    p.style.display = 'none';
                    p.classList.remove('active');
                }
            });
        });
    });
    
    
    
    if (DOM['btn-back-center']) {
        DOM['btn-back-center'].addEventListener('click', () => {
            showScreen('idle-screen');
        });
    }
}

function showScreen(screenId) {
    const screens = ['idle-screen', 'create-game-area', 'active-game-area', 'game-summary-area'];
    screens.forEach(id => {
        if (DOM[id]) {
            if (id === screenId) {
                DOM[id].style.display = id === 'idle-screen' ? 'flex' : 'block';
                DOM[id].classList.add('active');
            } else {
                DOM[id].style.display = 'none';
                DOM[id].classList.remove('active');
            }
        }
    });
    
    if (DOM['center-nav']) {
        if (screenId === 'create-game-area') {
            DOM['center-nav'].style.display = 'flex';
            if (DOM['center-title']) DOM['center-title'].textContent = t('Nouveau Projet') || 'Nouveau Projet';
        } else {
            DOM['center-nav'].style.display = 'none';
        }
    }
}



function updateRecherchesUI() {
    const genresList = DOM['recherche-genres-list'];
    if (genresList) {
        genresList.innerHTML = '';
        const sortedGenres = [...GENRES_CONFIG].sort((a, b) => (a.coutRecherche || 10) - (b.coutRecherche || 10));
        sortedGenres.forEach(genre => {
            if (!GAME_STATE.genresDebloques.includes(genre.nom)) {
                const item = document.createElement('div');
                item.className = 'recherche-item';
                item.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px dashed rgba(255,255,255,0.1);';
                
                const label = document.createElement('span');
                const btn = document.createElement('button');
                btn.className = "btn-small";
                
                const conditionMet = !genre.condition || genre.condition(GAME_STATE.historique || [], GAME_STATE);
                
                if (!conditionMet) {
                    label.innerHTML = (genre.icon || "🎮") + " " + t(genre.nom) + " <br><small style='color: #bf616a;'>🔒 " + t(genre.conditionText) + "</small>";
                    btn.textContent = t("Bloqué");
                    btn.disabled = true;
                    btn.style.backgroundColor = "#4c566a";
                    btn.style.color = "#eceff4";
                } else {
                    label.textContent = (genre.icon || "🎮") + " " + t(genre.nom);
                    btn.textContent = t("Débloquer");
                    btn.onclick = () => {
                        if (rechercherGenre(genre.nom)) {
                            updateUI();
                        }
                    };
                }
                
                item.appendChild(label);
                item.appendChild(btn);
                genresList.appendChild(item);
            }
        });
        if (genresList.innerHTML === '') {
            genresList.innerHTML = "<em>" + t("Tous les genres sont débloqués.") + "</em>";
        }
    }
    
    const sujetsList = DOM['recherche-sujets-list'];
    if (sujetsList) {
        sujetsList.innerHTML = '';
        const sortedSujets = [...SUJETS_CONFIG].sort((a, b) => (a.coutRecherche || 5) - (b.coutRecherche || 5));
        sortedSujets.forEach(sujet => {
            if (!GAME_STATE.sujetsDebloques.includes(sujet.nom)) {
                const item = document.createElement('div');
                item.className = 'recherche-item';
                item.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px dashed rgba(255,255,255,0.1);';
                
                const label = document.createElement('span');
                const btn = document.createElement('button');
                btn.className = "btn-small";
                
                const conditionMet = !sujet.condition || sujet.condition(GAME_STATE.historique || [], GAME_STATE);
                
                if (!conditionMet) {
                    label.innerHTML = (sujet.icon ? sujet.icon + " " : "") + t(sujet.nom) + " <br><small style='color: #bf616a;'>🔒 " + t(sujet.conditionText) + "</small>";
                    btn.textContent = t("Bloqué");
                    btn.disabled = true;
                    btn.style.backgroundColor = "#4c566a";
                    btn.style.color = "#eceff4";
                } else {
                    label.textContent = (sujet.icon ? sujet.icon + " " : "") + t(sujet.nom);
                    btn.textContent = t("Débloquer");
                    btn.onclick = () => {
                        if (rechercherSujet(sujet.nom)) {
                            updateUI();
                        }
                    };
                }
                
                item.appendChild(label);
                item.appendChild(btn);
                sujetsList.appendChild(item);
            }
        });
        
        if (sujetsList && sujetsList.innerHTML === '') {
            sujetsList.innerHTML = "<em>" + t("Tous les sujets sont débloqués.") + "</em>";
        }
    }
    
    const platsList = DOM['recherche-plateformes-list'];
    if (platsList) {
        platsList.innerHTML = '';
        const sortedPlats = [...PLATEFORMES_CONFIG].filter(p => p.coutRecherche > 0);
        sortedPlats.forEach(plat => {
            if (!GAME_STATE.plateformesDebloquees.includes(plat.nom)) {
                const item = document.createElement('div');
                item.className = 'recherche-item';
                item.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px dashed rgba(255,255,255,0.1);';
                
                const label = document.createElement('span');
                const btn = document.createElement('button');
                btn.className = "btn-small";
                
                let isLocked = false;
                let lockedReason = "";
                
                if (plat.nom === "Toutes les plateformes") {
                    if (!GAME_STATE.plateformesDebloquees.includes("Mobile") || !GAME_STATE.plateformesDebloquees.includes("Consoles")) {
                        isLocked = true;
                        lockedReason = t("Nécessite Mobile & Consoles");
                    }
                }
                if (plat.nom === "VR") {
                    if (!GAME_STATE.plateformesDebloquees.includes("Toutes les plateformes")) {
                        isLocked = true;
                        lockedReason = t("Nécessite Toutes les plateformes");
                    }
                }
                
                const conditionMet = !plat.condition || plat.condition(GAME_STATE.historique || [], GAME_STATE);
                if (!conditionMet) {
                    isLocked = true;
                    if (lockedReason) lockedReason += " + ";
                    lockedReason += t(plat.conditionText);
                }
                
                if (isLocked) {
                    label.innerHTML = (plat.icon ? plat.icon + " " : "") + t(plat.nom) + " <br><small style='color: #bf616a;'>🔒 " + lockedReason + "</small>";
                    btn.textContent = t("Bloqué");
                    btn.disabled = true;
                    btn.style.backgroundColor = "#4c566a";
                    btn.style.color = "#eceff4";
                } else {
                    label.textContent = (plat.icon ? plat.icon + " " : "") + t(plat.nom);
                    btn.textContent = t("Débloquer");
                    btn.onclick = () => {
                        if (rechercherPlateforme(plat.nom)) {
                            updateUI();
                        }
                    };
                }
                
                item.appendChild(label);
                item.appendChild(btn);
                platsList.appendChild(item);
            }
        });
        
        if (platsList.innerHTML === '') {
            platsList.innerHTML = "<em>" + t("Toutes les plateformes sont débloquées.") + "</em>";
        }
    }
}

function getScoreColor(note) {
    if (note >= 75) return '#a3be8c';
    if (note >= 50) return '#ebcb8b';
    if (note >= 25) return '#d08770';
    return '#bf616a';
}

export function updateUI() { try {
    updateDOM();
    populateDropdowns();

    // Change le fond d'écran en fonction du niveau du studio (max 5)
    let bgLevel = Math.min(GAME_STATE.niveauStudio || 1, 5);
    const expectedFilename = "/bg_level" + bgLevel + "_v4.jpg";
    const currentBg = document.body.style.backgroundImage || "";
    if (!currentBg.includes(expectedFilename)) {
        const bgUrl = "url('" + expectedFilename + "')";
        document.body.style.backgroundImage = bgUrl;
    }

    if (!DOM['studio-name']) return; // Sécurité si updateUI appelé trop tôt

    // Mise à jour de la barre supérieure
    
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

    // Studio Upgrade UI
    const btnUpgradeStudio = DOM['btn-upgrade-studio'];
    const studioProgress = DOM['studio-progress'];
    const studioPriceContainer = DOM['studio-upgrade-price-container'];
    const studioNextBenefits = DOM['studio-next-benefits'];
    const studioPriceEl = DOM['studio-price'];
    
    if (btnUpgradeStudio) {
        const niveauActuel = GAME_STATE.niveauStudio || 1;
        
        if (GAME_STATE.studioAmeliorationEnCours) {
            btnUpgradeStudio.disabled = true;
            btnUpgradeStudio.textContent = t("Amélioration en cours...");
            if (studioProgress) studioProgress.style.width = (GAME_STATE.studioAmeliorationProgress || 0) + "%";
            if (studioPriceContainer) studioPriceContainer.style.display = 'none';
        } else if (niveauActuel >= 5) {
            btnUpgradeStudio.disabled = true;
            btnUpgradeStudio.textContent = t("Niveau Maximum");
            if (studioProgress) studioProgress.style.width = "100%";
            if (studioPriceContainer) studioPriceContainer.style.display = 'none';
            if (studioNextBenefits) studioNextBenefits.textContent = t("Vous avez atteint le niveau maximum de studio !");
        } else {
            const nextLevel = niveauActuel + 1;
            const config = STUDIO_LEVELS_CONFIG[nextLevel];
            if (config) {
                btnUpgradeStudio.textContent = t("Améliorer le Studio");
                btnUpgradeStudio.disabled = GAME_STATE.argent < config.prix;
                if (studioProgress) studioProgress.style.width = "0%";
                if (studioPriceContainer) studioPriceContainer.style.display = 'block';
                if (studioPriceEl) studioPriceEl.textContent = config.prix.toLocaleString();
                if (studioNextBenefits) studioNextBenefits.textContent = t(config.avantages);
            }
        }
    }

    
    // Personnage
    const nivPerso = GAME_STATE.niveauPersonnage || 1;
    if (DOM['perso-level']) DOM['perso-level'].textContent = nivPerso;
    
    if (DOM['perso-progress']) {
        DOM['perso-progress'].style.width = `${(nivPerso / MAX_NIVEAU_PERSONNAGE) * 100}%`;
    }
    
    const btnPerso = DOM['btn-upgrade-perso'];
    const pricePersoContainer = DOM['perso-price-container'];
    
    if (btnPerso && pricePersoContainer) {
        const maxAllowed = getMaxLevelAllowed();
        if (nivPerso >= MAX_NIVEAU_PERSONNAGE) {
            btnPerso.disabled = true;
            pricePersoContainer.innerHTML = t("Niveau Max absolu");
        } else if (nivPerso >= maxAllowed) {
            btnPerso.disabled = true;
            pricePersoContainer.innerHTML = `<span style="color:var(--text-color);font-size:0.9em;opacity:0.8;">${t("Bloqué (Améliorez le studio)")}</span>`;
        } else {
            const prix = calculerPrixPersonnage(nivPerso);
            pricePersoContainer.innerHTML = `${t("Prix : ")}<span id="perso-price">${prix.toLocaleString()}</span> $`;
            btnPerso.disabled = GAME_STATE.argent < prix;
        }
    }
    // Moteur
    const nivMoteur = GAME_STATE.niveauMoteur || 1;
    if (DOM['moteur-level']) DOM['moteur-level'].textContent = nivMoteur;
    
    if (DOM['moteur-progress']) {
        DOM['moteur-progress'].style.width = `${(nivMoteur / MAX_NIVEAU_MOTEUR) * 100}%`;
    }
    
    const btnMoteur = DOM['btn-upgrade-moteur'];
    const priceMoteurContainer = DOM['moteur-price-container'];

    if (btnMoteur && priceMoteurContainer) {
        const maxAllowed = getMaxLevelAllowed();
        if (nivMoteur >= MAX_NIVEAU_MOTEUR) {
            btnMoteur.disabled = true;
            priceMoteurContainer.innerHTML = t("Niveau Max absolu");
        } else if (nivMoteur >= maxAllowed) {
            btnMoteur.disabled = true;
            priceMoteurContainer.innerHTML = `<span style="color:var(--text-color);font-size:0.9em;opacity:0.8;">${t("Bloqué (Améliorez le studio)")}</span>`;
        } else {
            const prix = calculerPrixMoteur(nivMoteur);
            priceMoteurContainer.innerHTML = `${t("Prix : ")}<span id="moteur-price">${prix.toLocaleString()}</span> $`;
            btnMoteur.disabled = GAME_STATE.argent < prix;
        }
    }

    // Gestion de l'affichage central (Zones)
    if (GAME_STATE.jeuEnDeveloppement) {
        const jeu = GAME_STATE.jeuEnDeveloppement;
        if (jeu.statut === "resume") {
            // Deprecated state, shouldn't occur anymore, but fallback just in case
            showScreen('idle-screen');
        } else {
            showScreen('active-game-area');
            
            const activeNameEl = document.getElementById('active-game-name');
            if(activeNameEl) activeNameEl.textContent = jeu.nom;
            
            const devSection = document.getElementById('development-progress-section');
            const scoringSection = document.getElementById('active-game-scoring-section');
            
            if (jeu.statut === "developpement") {
                if(devSection) devSection.style.display = 'block';
                if(scoringSection) scoringSection.style.display = 'none';
                
                const pointsNecessaires = jeu.pointsNecessaires || 20;
                const pct = Math.min(100, (jeu.progression / pointsNecessaires) * 100);
                const progressTextEl = document.getElementById('active-game-progress-text');
                const progressBarEl = document.getElementById('active-game-progress-bar');
                
                if(progressTextEl) progressTextEl.textContent = Math.floor(jeu.progression) + ' / ' + pointsNecessaires;
                if(progressBarEl) progressBarEl.style.width = pct + "%";
            } else if (jeu.statut === "notation") {
                if(devSection) devSection.style.display = 'block';
                if(scoringSection) scoringSection.style.display = 'none';

                const pointsNecessaires = jeu.pointsNecessaires || 20;
                const pct = Math.min(100, (jeu.progression / pointsNecessaires) * 100);
                const progressTextEl = document.getElementById('active-game-progress-text');
                const progressBarEl = document.getElementById('active-game-progress-bar');
                if(progressTextEl) progressTextEl.textContent = Math.floor(jeu.progression) + ' / ' + pointsNecessaires;
                if(progressBarEl) progressBarEl.style.width = pct + "%";

                const scoreModal = document.getElementById('score-modal');
                if (scoreModal) {
                    scoreModal.style.display = 'flex';
                    const rechGainsEl = document.getElementById('modal-recherche-gains');
                    if (rechGainsEl && !jeu.animationStarted) rechGainsEl.textContent = '';
                    const scoreGameName = document.getElementById('score-game-name');
                    if (scoreGameName) scoreGameName.textContent = jeu.nom;
                }
                
                const scoreEl = document.getElementById('modal-animated-score');
                const finishBtn = document.getElementById('btn-finish-score');

                if(scoreEl) {
                    if (!jeu.animationStarted) {
                        jeu.animationStarted = true;
                        let currentScore = 0;
                        const targetScore = jeu.note || 0;
                        const animDuration = 4000; // 4 seconds
                        const startTime = performance.now();
                        
                        function step(time) {
                            const elapsed = time - startTime;
                            const progress = Math.min(elapsed / animDuration, 1);
                            // Easing function (easeOutExpo)
                            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
                            currentScore = Math.floor(easeProgress * targetScore);
                            
                            scoreEl.textContent = currentScore;
                            scoreEl.style.color = getScoreColor(currentScore);
                            
                            if (progress < 1) {
                                requestAnimationFrame(step);
                            } else {
                                scoreEl.textContent = targetScore;
                                scoreEl.style.color = getScoreColor(targetScore);
                                const rechGainsEl = document.getElementById('modal-recherche-gains');
                                if (rechGainsEl) rechGainsEl.style.display = 'none';
                                if (finishBtn) finishBtn.style.display = 'block';
                            }
                        }
                        requestAnimationFrame(step);
                    } else {
                        if (!jeu.animationStartTime) jeu.animationStartTime = performance.now();
                        if (performance.now() - jeu.animationStartTime > 5000) {
                            scoreEl.textContent = jeu.note || 0;
                            scoreEl.style.color = getScoreColor(jeu.note || 0);
                            if (finishBtn) finishBtn.style.display = 'block';
                        }
                    }
                }
            }
        }
    } else {
        const createArea = DOM['create-game-area'];
        if (!createArea || (!createArea.classList.contains('active'))) {
            showScreen('idle-screen');
        }
    }

    // Mise a jour des jeux en vente
    const elRecentList = DOM['recent-games-list'];
    if (elRecentList) {
        elRecentList.innerHTML = '';
        if (GAME_STATE.jeuxEnVente && GAME_STATE.jeuxEnVente.length > 0) {
            GAME_STATE.jeuxEnVente.forEach(jeu => {
                const item = document.createElement('div');
                item.className = 'history-item';
                
                const title = document.createElement('h4');
                title.textContent = jeu.nom;
                
                const info = document.createElement('p');
                const genreObj = GENRES_CONFIG.find(g => g.nom === jeu.genre);
                const genreIcon = genreObj && genreObj.icon ? genreObj.icon : '🎮';
                info.innerHTML = `${genreIcon} ${t(jeu.genre)} | ${t(jeu.sujet)} <br><strong>${t("Note : ")}</strong> <span style="color: ${getScoreColor(jeu.note)}; font-weight: bold;">${jeu.note}/100</span> <br><strong>${t("Revenus/s :")}</strong> ${Math.floor(jeu.revenuPSActuel || 0).toLocaleString()} \$ <br><strong>${t("Total :")}</strong> ${Math.floor(jeu.argentTotalGagne || 0).toLocaleString()} \$`;

                
                item.appendChild(title);
                item.appendChild(info);
                elRecentList.appendChild(item);
            });
        } else {
            elRecentList.innerHTML = `<p>${t('Aucun jeu en vente.')}</p>`;
        }
    }

    updateRecherchesUI();
    updateEmployesUI();
    updateGameSizesUI();

    // Mise à jour de l'historique
    const elHistoryList = DOM['games-history-list'];
    if (elHistoryList) {
        elHistoryList.innerHTML = '';
        if (GAME_STATE.historique && GAME_STATE.historique.length > 0) {
            let sortedHistory = [...GAME_STATE.historique].reverse(); // par défaut (plus récents en premier)
            const historySortSelect = document.getElementById('history-sort');
            if (historySortSelect) {
                const sortValue = historySortSelect.value;
                if (sortValue === 'score_desc') {
                    sortedHistory = [...GAME_STATE.historique].sort((a, b) => b.note - a.note);
                } else if (sortValue === 'score_asc') {
                    sortedHistory = [...GAME_STATE.historique].sort((a, b) => a.note - b.note);
                } else if (sortValue === 'revenue_desc') {
                    sortedHistory = [...GAME_STATE.historique].sort((a, b) => (b.argentTotalGagne || 0) - (a.argentTotalGagne || 0));
                } else if (sortValue === 'revenue_asc') {
                    sortedHistory = [...GAME_STATE.historique].sort((a, b) => (a.argentTotalGagne || 0) - (b.argentTotalGagne || 0));
                }
            }

            sortedHistory.forEach(jeu => {
                const item = document.createElement('div');
                item.className = 'history-item';
                
                const title = document.createElement('h4');
                title.textContent = jeu.nom;
                
                const info = document.createElement('p');
                const genreObj = GENRES_CONFIG.find(g => g.nom === jeu.genre);
                const genreIcon = genreObj && genreObj.icon ? genreObj.icon : '🎮';
                info.innerHTML = `${genreIcon} ${t(jeu.genre)} | ${t(jeu.sujet)} <br><strong>${t("Note : ")}</strong> <span style="color: ${getScoreColor(jeu.note)}; font-weight: bold;">${jeu.note}/100</span> <br><strong>${t("Total rapporté :")}</strong> ${Math.floor(jeu.argentTotalGagne || 0).toLocaleString()} \$`;
                item.appendChild(title);
                item.appendChild(info);
                
                elHistoryList.appendChild(item);
            });
        } else {
            elHistoryList.innerHTML = `<p>${t('Aucun jeu terminé.')}</p>`;
        }
    }

    } catch(e) { console.error('updateUI error:', e); const el = document.getElementById('active-game-title'); if(el) el.innerHTML += '<div style="color:red;font-size:12px;">' + e.message + '</div>'; }
}

export function addEventLog(message) {
    const eventLog = DOM['mini-event-log'];
    if (!eventLog) return;
    eventLog.innerHTML = `<p>> ${message}</p>`;
}

function populateDropdowns() {
    const genreSelect = DOM['game-genre'] || document.getElementById('game-genre');
    if (genreSelect && GAME_STATE.genresDebloques) {
        // Build expected options
        const expectedGenres = GENRES_CONFIG.length;
        if (true) {
            const currentVal = genreSelect.value;
            genreSelect.innerHTML = '';
            GENRES_CONFIG.forEach(genre => {
                const option = document.createElement('option');
                option.value = genre.nom;
                const isUnlocked = GAME_STATE.genresDebloques.includes(genre.nom);
                if (isUnlocked) {
                    option.textContent = `${genre.icon || "🎮"} ${t(genre.nom)}`;
                    option.disabled = false;
                } else {
                    option.textContent = `🔒 ${genre.icon || "🎮"} ${t(genre.nom)} (${t("Verrouillé")})`;
                    option.disabled = true;
                }
                genreSelect.appendChild(option);
            });
            if (currentVal && GAME_STATE.genresDebloques.includes(currentVal)) {
                genreSelect.value = currentVal;
            } else {
                genreSelect.value = GAME_STATE.genresDebloques[0];
            }
        } else {
            // Update statuses just in case
            Array.from(genreSelect.options).forEach(option => {
                const genre = GENRES_CONFIG.find(g => g.nom === option.value);
                if (genre) {
                    const isUnlocked = GAME_STATE.genresDebloques.includes(genre.nom);
                    if (isUnlocked && option.disabled) { option.textContent = `${genre.icon || "🎮"} ${t(genre.nom)}`; option.disabled = false; }
                }
            });
        }
    }

    const subjectSelect = DOM['game-subject'] || document.getElementById('game-subject');
    if (subjectSelect && GAME_STATE.sujetsDebloques) {
        const expectedSujets = SUJETS_CONFIG.length;
        if (true) {
            const currentVal = subjectSelect.value;
            subjectSelect.innerHTML = '';
            SUJETS_CONFIG.forEach(sujet => {
                const option = document.createElement('option');
                option.value = sujet.nom;
                const isUnlocked = GAME_STATE.sujetsDebloques.includes(sujet.nom);
                if (isUnlocked) {
                    option.textContent = (sujet.icon ? sujet.icon + " " : "") + t(sujet.nom);
                    option.disabled = false;
                } else {
                    option.textContent = `🔒 ${sujet.icon ? sujet.icon + " " : ""}${t(sujet.nom)} - ${t("Verrouillé")}`;
                    option.disabled = true;
                }
                subjectSelect.appendChild(option);
            });
            if (currentVal && GAME_STATE.sujetsDebloques.includes(currentVal)) {
                subjectSelect.value = currentVal;
            } else {
                subjectSelect.value = GAME_STATE.sujetsDebloques[0];
            }
        } else {
            Array.from(subjectSelect.options).forEach(option => {
                const sujet = SUJETS_CONFIG.find(s => s.nom === option.value);
                if (sujet) {
                    const isUnlocked = GAME_STATE.sujetsDebloques.includes(sujet.nom);
                    if (isUnlocked && option.disabled) { option.textContent = (sujet.icon ? sujet.icon + " " : "") + t(sujet.nom); option.disabled = false; }
                }
            });
        }
    }
    const platformSelect = document.getElementById('game-platform');
    if (platformSelect && GAME_STATE.plateformesDebloquees) {
        const expectedPlatforms = PLATEFORMES_CONFIG.length;
        if (platformSelect.options.length !== expectedPlatforms) {
            const currentVal = platformSelect.value;
            platformSelect.innerHTML = '';
            PLATEFORMES_CONFIG.forEach(plat => {
                const option = document.createElement('option');
                option.value = plat.nom;
                const isUnlocked = GAME_STATE.plateformesDebloquees.includes(plat.nom);
                if (isUnlocked) {
                    option.textContent = (plat.icon ? plat.icon + " " : "") + t(plat.nom);
                    option.disabled = false;
                } else {
                    option.textContent = `🔒 ${plat.icon ? plat.icon + " " : ""}${t(plat.nom)} (${t("Verrouillé")})`;
                    option.disabled = true;
                }
                platformSelect.appendChild(option);
            });
            if (currentVal && GAME_STATE.plateformesDebloquees.includes(currentVal)) {
                platformSelect.value = currentVal;
            } else {
                platformSelect.value = GAME_STATE.plateformesDebloquees[0] || "PC";
            }
        } else {
            Array.from(platformSelect.options).forEach(option => {
                const plat = PLATEFORMES_CONFIG.find(p => p.nom === option.value);
                if (plat) {
                    const isUnlocked = GAME_STATE.plateformesDebloquees.includes(plat.nom);
                    if (isUnlocked && option.disabled) { option.textContent = (plat.icon ? plat.icon + " " : "") + t(plat.nom); option.disabled = false; }
                }
            });
        }
    }
}

function initGame() {

    initDOMCache();
    initTabs();
    populateDropdowns();

    const hasSave = loadGame();
    startGameLoop();

    if (!hasSave) {
        saveGame();
        // Show welcome modal
        const welcomeModal = DOM['welcome-modal'];
        if (welcomeModal) {
            welcomeModal.style.display = 'flex';
        }
    } else {

        if (GAME_STATE.jeuxCrees > 0) {
            const eventLog = DOM['event-log'];
            if (eventLog) {
                eventLog.innerHTML = '';
                eventLog.classList.remove('placeholder');
                addEventLog(t("Bienvenue de retour dans votre studio !"));
            }
        }
    }

    updateUI();
    startAutoSave(30000);
    setupEventListeners();
}




function snapSlidersToBest(genre) {
    if (!GAME_STATE.feedbackCurseurs || !GAME_STATE.feedbackCurseurs[genre]) return;
    
    const sliders = [
        { id: 'slider-scenario-missions', key: 'scenarioMissions' },
        { id: 'slider-graphismes-gameplay', key: 'graphismesGameplay' },
        { id: 'slider-facile-difficile', key: 'facileDifficile' },
        { id: 'slider-atmosphere-mecaniques', key: 'atmosphereMecaniques' }
    ];

    sliders.forEach(s => {
        const feedback = GAME_STATE.feedbackCurseurs[genre][s.key];
        if (feedback) {
            for (let i = 1; i <= 9; i++) {
                if (feedback[i.toString()] === "vert") {
                    const el = document.getElementById(s.id);
                    if (el) el.value = i;
                    break;
                }
            }
        }
    });
}

function updateSliderFeedback() {
    const genreSelect = document.getElementById('game-genre');
    if (!genreSelect) return;
    const currentGenre = genreSelect.value;
    
    const sliders = [
        { id: 'slider-scenario-missions', key: 'scenarioMissions' },
        { id: 'slider-graphismes-gameplay', key: 'graphismesGameplay' },
        { id: 'slider-facile-difficile', key: 'facileDifficile' },
        { id: 'slider-atmosphere-mecaniques', key: 'atmosphereMecaniques' }
    ];
    
    sliders.forEach(s => {
        const el = document.getElementById(s.id);
        if (!el) return;
        
        // Thumb always neutral
        el.classList.remove('slider-good', 'slider-bad', 'slider-neutral');
        el.classList.add('slider-neutral');
        
        const ticksContainer = el.nextElementSibling;
        if (ticksContainer && ticksContainer.classList.contains('slider-ticks')) {
            const ticks = ticksContainer.querySelectorAll('span');
            ticks.forEach(tick => {
                tick.style.color = '#4c566a';
                tick.style.fontWeight = 'normal';
                tick.style.textShadow = 'none';
            });
            
            if (GAME_STATE.feedbackCurseurs && GAME_STATE.feedbackCurseurs[currentGenre] && GAME_STATE.feedbackCurseurs[currentGenre][s.key]) {
                const feedback = GAME_STATE.feedbackCurseurs[currentGenre][s.key];
                for (let i = 1; i <= 9; i++) {
                    const status = feedback[i.toString()];
                    if (status) {
                        const tick = ticks[i - 1];
                        if (tick) {
                            if (status === "vert") {
                                tick.style.color = "#4ade80"; // Bright Green
                                tick.style.fontWeight = "900";
                                tick.style.textShadow = "0 0 8px #4ade80";
                            } else if (status === "rouge") {
                                tick.style.color = "#ef4444"; // Bright Red
                                tick.style.fontWeight = "900";
                                tick.style.textShadow = "0 0 8px #ef4444";
                            }
                        }
                    }
                }
            }
        }
    });
}

function setupEventListeners() {
    const historySortSelect = document.getElementById('history-sort');
    if (historySortSelect) {
        historySortSelect.addEventListener('change', () => {
            updateUI();
        });
    }

    const saveBtn = DOM['btn-save-game'];
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            saveGame();
            const originalText = saveBtn.textContent;
            saveBtn.textContent = "✅ Sauvegardé!";
            saveBtn.style.backgroundColor = "#2ecc71";
            setTimeout(() => {
                saveBtn.textContent = originalText;
                saveBtn.style.backgroundColor = "#27ae60";
            }, 1500);
        });
    }

    
    const btnStartAdventure = DOM['btn-start-adventure'];
    if (btnStartAdventure) {
        btnStartAdventure.addEventListener('click', () => {
            const studioName = DOM['startup-studio-name'].value.trim() || "Mon Super Studio";
            const engineName = DOM['startup-engine-name'].value.trim() || "Moteur Alpha";
            
            GAME_STATE.nomStudio = studioName;
            GAME_STATE.nomMoteur = engineName;
            
            DOM['welcome-modal'].style.display = 'none';
            updateUI();
            saveGame();
        });
    }

    
    const resetBtn = DOM['btn-reset-modal'];
    const confirmModal = DOM['reset-confirm-modal'];
    const btnCancelReset = DOM['btn-cancel-reset'];
    const btnConfirmReset = DOM['btn-confirm-reset'];
    
    if (resetBtn && confirmModal) {
        resetBtn.addEventListener('click', () => {
            confirmModal.style.display = 'flex';
        });
    }

    if (btnCancelReset && confirmModal) {
        btnCancelReset.addEventListener('click', () => {
            confirmModal.style.display = 'none';
        });
    }

    if (btnConfirmReset && confirmModal) {
        btnConfirmReset.addEventListener('click', () => {
            confirmModal.style.display = 'none';
            resetGame();
        });
    }

    const btnSettings = DOM['btn-settings'];
    const settingsModal = DOM['settings-modal'];
    const btnCloseSettings = DOM['btn-close-settings'];

    if (btnSettings && settingsModal) {
        btnSettings.addEventListener('click', () => {
            DOM['settings-studio-name'].value = GAME_STATE.nomStudio || "";
            DOM['settings-engine-name'].value = GAME_STATE.nomMoteur || "";
            settingsModal.style.display = 'flex';
        });
    }

    if (btnCloseSettings && settingsModal) {
        btnCloseSettings.addEventListener('click', () => {
            settingsModal.style.display = 'none';
        });
    }

    const btnSaveLanguage = DOM['btn-save-language'];
    if (btnSaveLanguage) {
        btnSaveLanguage.addEventListener('click', () => {
            const selectLang = DOM['settings-language'];
            if (selectLang) {
                GAME_STATE.language = selectLang.value;
                saveGame();
                location.reload();
            }
        });
    }

    const btnSaveStudio = DOM['btn-save-studio-name'];
    if (btnSaveStudio) {
        btnSaveStudio.addEventListener('click', () => {
            const newName = DOM['settings-studio-name'].value.trim();
            if (newName) {
                GAME_STATE.nomStudio = newName;
                updateUI();
                saveGame();
                const originalText = btnSaveStudio.textContent;
                btnSaveStudio.textContent = "✅";
                setTimeout(() => { btnSaveStudio.textContent = originalText; }, 1000);
            }
        });
    }

    const btnSaveEngine = DOM['btn-save-engine-name'];
    if (btnSaveEngine) {
        btnSaveEngine.addEventListener('click', () => {
            const newName = DOM['settings-engine-name'].value.trim();
            if (newName) {
                GAME_STATE.nomMoteur = newName;
                updateUI();
                saveGame();
                const originalText = btnSaveEngine.textContent;
                btnSaveEngine.textContent = "✅";
                setTimeout(() => { btnSaveEngine.textContent = originalText; }, 1000);
            }
        });
    }


    const btnCancelDev = document.getElementById('btn-cancel-dev');
    if (btnCancelDev) {
        btnCancelDev.addEventListener('click', () => {
            {
                GAME_STATE.jeuEnDeveloppement = null;
                updateUI();
                const showCreateBtn = document.getElementById('btn-show-create');
                if(showCreateBtn) showCreateBtn.click();
            }
        });
    }

    const createGameBtn = document.getElementById('btn-create-game');
    if (createGameBtn) {
        createGameBtn.addEventListener('click', () => {
            createGame();
        });
    }

    const btnShowCreate = document.getElementById('btn-show-create');
    const modal = document.getElementById('create-game-modal');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const errorText = document.getElementById('create-error');
    
    if (btnShowCreate) {
        btnShowCreate.addEventListener('click', () => {
            if(modal) {
                modal.style.display = 'flex';
                errorText.textContent = '';
                const tabMarketingBtn = document.getElementById('tab-btn-marketing');
                if (tabMarketingBtn) tabMarketingBtn.style.display = (GAME_STATE.niveauStudio >= 2) ? 'inline-block' : 'none';
                const genreSel = document.getElementById('game-genre');
                if (genreSel) snapSlidersToBest(genreSel.value);
                updateSliderFeedback();
                
                // Reset Marketing
                const marketingRadios = document.querySelectorAll('input[name="game-marketing"]');
                marketingRadios.forEach(o => {
                    o.checked = false;
                    o.parentElement.classList.remove('active');
                });
                
                // Unlock logic
                const lvl = GAME_STATE.niveauStudio;
                const mktTrailer = document.getElementById('label-marketing-trailer');
                const mktSocial = document.getElementById('label-marketing-social');
                const mktPress = document.getElementById('label-marketing-press');
                const mktTv = document.getElementById('label-marketing-tv');
                
                if (mktTrailer) {
                    mktTrailer.classList.toggle('locked', lvl < 2);
                    mktTrailer.querySelector('input').disabled = (lvl < 2);
                    if (lvl < 2) mktTrailer.title = t("Nécessite le niveau 2 de studio") || "Nécessite le niveau 2 de studio";
                    else mktTrailer.title = "";
                }
                if (mktSocial) {
                    mktSocial.classList.toggle('locked', lvl < 3);
                    mktSocial.querySelector('input').disabled = (lvl < 3);
                    if (lvl < 3) mktSocial.title = t("Nécessite le niveau 3 de studio") || "Nécessite le niveau 3 de studio";
                    else mktSocial.title = "";
                }
                if (mktPress) {
                    mktPress.classList.toggle('locked', lvl < 4);
                    mktPress.querySelector('input').disabled = (lvl < 4);
                    if (lvl < 4) mktPress.title = t("Nécessite le niveau 4 de studio") || "Nécessite le niveau 4 de studio";
                    else mktPress.title = "";
                }
                if (mktTv) {
                    mktTv.classList.toggle('locked', lvl < 5);
                    mktTv.querySelector('input').disabled = (lvl < 5);
                    if (lvl < 5) mktTv.title = t("Nécessite le niveau 5 de studio") || "Nécessite le niveau 5 de studio";
                    else mktTv.title = "";
                }
                
                // Reset à l'onglet projet par défaut
                const projetTabBtn = document.querySelector('.modal-tab-btn[data-target="modal-tab-projet"]');
                if (projetTabBtn) projetTabBtn.click();
            }
        });
    }

    const btnShowRecherche = document.getElementById('btn-show-recherche');
    const rechercheModal = document.getElementById('recherche-modal');
    const btnCloseRecherche = document.getElementById('btn-close-recherche');

    if (btnShowRecherche) {
        btnShowRecherche.addEventListener('click', () => {
            if(rechercheModal) {
                rechercheModal.style.display = 'flex';
                updateRecherchesUI();
            }
        });
    }

    if (btnCloseRecherche) {
        btnCloseRecherche.addEventListener('click', () => {
            if(rechercheModal) {
                rechercheModal.style.display = 'none';
            }
        });
    }
    
    if (btnCloseModal) {
        btnCloseModal.addEventListener('click', () => {
            if(modal) modal.style.display = 'none';
        });
    }
    
    // Modal tabs
    document.querySelectorAll('.modal-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = e.target.getAttribute('data-target');
            document.querySelectorAll('.modal-tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            document.querySelectorAll('.modal-tab-pane').forEach(p => {
                if (p.id === targetId) {
                    p.style.display = 'block';
                } else {
                    p.style.display = 'none';
                }
            });

            // Gérer l'affichage des boutons selon l'onglet
            const btnNext = document.getElementById('btn-next-settings');
            const btnCreate = document.getElementById('btn-create-game');
            if (targetId === 'modal-tab-projet') {
                if (btnNext) { btnNext.style.display = 'block'; btnNext.textContent = t("Passer aux réglages") || "Passer aux réglages"; }
                if (btnCreate) btnCreate.style.display = 'none';
            } else if (targetId === 'modal-tab-reglages') {
                if (GAME_STATE.niveauStudio >= 2) {
                    if (btnNext) { btnNext.style.display = 'block'; btnNext.textContent = t("Passer au Marketing") || "Passer au Marketing"; }
                    if (btnCreate) btnCreate.style.display = 'none';
                } else {
                    if (btnNext) btnNext.style.display = 'none';
                    if (btnCreate) btnCreate.style.display = 'block';
                }
            } else if (targetId === 'modal-tab-marketing') {
                if (btnNext) btnNext.style.display = 'none';
                if (btnCreate) btnCreate.style.display = 'block';
            }
        });
    });
    
    // Bouton "Passer aux réglages/marketing"
    const btnNextSettings = document.getElementById('btn-next-settings');
    if (btnNextSettings) {
        btnNextSettings.addEventListener('click', () => {
            const activeTab = document.querySelector('.modal-tab-btn.active');
            if (activeTab && activeTab.getAttribute('data-target') === 'modal-tab-projet') {
                const reglagesTabBtn = document.querySelector('.modal-tab-btn[data-target="modal-tab-reglages"]');
                if (reglagesTabBtn) reglagesTabBtn.click();
            } else if (activeTab && activeTab.getAttribute('data-target') === 'modal-tab-reglages') {
                const marketingTabBtn = document.getElementById('tab-btn-marketing');
                if (marketingTabBtn) marketingTabBtn.click();
            }
        });
    }

    
    const genreSelect = document.getElementById('game-genre');
    if (genreSelect) {
        genreSelect.addEventListener('change', () => {
            snapSlidersToBest(genreSelect.value);
            updateSliderFeedback();
        });
    }
    
    const sliders = ['slider-scenario-missions', 'slider-graphismes-gameplay', 'slider-facile-difficile', 'slider-atmosphere-mecaniques'];
    sliders.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', updateSliderFeedback);
        }
    });

    const founderInput = document.getElementById('founder-name');
    if (founderInput) {
        // Initialize value
        if (GAME_STATE.nomFondateur) {
            let n = GAME_STATE.nomFondateur;
            if (n === "Fondateur" && getLanguage() === "en") {
                n = "Founder";
                GAME_STATE.nomFondateur = n;
            }
            if (n === "Founder" && getLanguage() === "fr") {
                n = "Fondateur";
                GAME_STATE.nomFondateur = n;
            }
            founderInput.value = n;
        } else {
            GAME_STATE.nomFondateur = getLanguage() === "en" ? "Founder" : "Fondateur";
            founderInput.value = GAME_STATE.nomFondateur;
        }
        
        founderInput.addEventListener('input', (e) => {
            GAME_STATE.nomFondateur = e.target.value || (getLanguage() === "en" ? "Founder" : "Fondateur");
        });
    }

    const btnUpgradePerso = DOM['btn-upgrade-perso'];
    if (btnUpgradePerso) {
        btnUpgradePerso.addEventListener('click', () => {
            ameliorerPersonnage();
            updateUI();
        });
    }

    const btnUpgradeMoteur = DOM['btn-upgrade-moteur'];
    if (btnUpgradeMoteur) {
        btnUpgradeMoteur.addEventListener('click', () => {
            ameliorerMoteurUnique();
            updateUI();
        });
    }

    const caracs = ['scenario', 'gameplay', 'graphismes', 'sons', 'dureeVie'];
    caracs.forEach(c => {
        const btn = DOM[`btn-prep-${c}`];
        if (btn) {
            btn.addEventListener('click', () => {
                ameliorerCaracteristique(c);
            });
        }
    });
    
    const campagnes = [
        { id: 'btn-pub-petite', type: 'Petite campagne' },
        { id: 'btn-pub-moyenne', type: 'Campagne moyenne' },
        { id: 'btn-pub-grande', type: 'Grande campagne' },
        { id: 'btn-pub-mondiale', type: 'Campagne mondiale' }
    ];
    
    campagnes.forEach(c => {
        const btn = DOM[c.id];
        if (btn) {
            btn.addEventListener('click', () => {
                acheterCampagnePublicitaire(c.type);
            });
        }
    });
    
    
    const btnUpgradeStudio = DOM['btn-upgrade-studio'];
    if (btnUpgradeStudio) {
        btnUpgradeStudio.addEventListener('click', () => {
            ameliorerStudio();
        });
    }

    const startDevBtn = DOM['btn-start-dev'];
    
    const finishScoreBtn = document.getElementById('btn-finish-score');
    if (finishScoreBtn) {
        finishScoreBtn.addEventListener('click', () => {
            const scoreModal = document.getElementById('score-modal');
            if (scoreModal) {
                scoreModal.style.display = 'none';
            }
            finishScoreBtn.style.display = 'none'; // reset for next time
            
            // Appeler finishGame
            finishGame();
            const showCreateBtn = document.getElementById('btn-show-create');
            if(showCreateBtn) showCreateBtn.click(); // simulate click to open creation screen
        });
    }

    if (startDevBtn) {
        startDevBtn.addEventListener('click', () => {
            commencerDeveloppement();
        });
    }
}


    // Add change listeners to size options
    document.querySelectorAll('input[name="game-size"]').forEach(input => {
        input.addEventListener('change', () => {
            document.querySelectorAll('.size-option').forEach(label => {
                const innerInput = label.querySelector('input');
                if (innerInput && innerInput.checked) {
                    label.classList.add('active');
                } else {
                    label.classList.remove('active');
                }
            });
        });
    });

    document.querySelectorAll('input[name="game-marketing"]').forEach(input => {
        input.addEventListener('change', () => {
            document.querySelectorAll('.size-option').forEach(label => {
                const innerInput = label.querySelector('input');
                if (innerInput && innerInput.checked) {
                    label.classList.add('active');
                } else {
                    label.classList.remove('active');
                }
            });
        });
    });

document.addEventListener('DOMContentLoaded', initGame);

window.addEventListener('error', function(event) {
    const el = document.getElementById('active-game-title');
    if (el) el.innerHTML += '<div style="color:red; font-size:12px;">' + event.message + '</div>';
});
window.addEventListener('unhandledrejection', function(event) {
    const el = document.getElementById('active-game-title');
    if (el) el.innerHTML += '<div style="color:red; font-size:12px;">' + event.reason + '</div>';
});

function confirmAction(btn, message) {
    if (btn.dataset.confirming === "true") {
        btn.dataset.confirming = "false";
        btn.textContent = btn.dataset.originalText;
        return true;
    } else {
        btn.dataset.originalText = btn.textContent;
        btn.textContent = "Êtes-vous sûr ?";
        btn.dataset.confirming = "true";
        setTimeout(() => {
            if (btn.dataset.confirming === "true") {
                btn.dataset.confirming = "false";
                btn.textContent = btn.dataset.originalText;
            }
        }, 3000);
        return false;
    }
}




function updateEmployesUI() {
    const container = document.getElementById('employes-container');
    if (!container) return;
    
    const niveauActuel = GAME_STATE.niveauStudio || 1;
    const needsRender = container.children.length !== Object.keys(EMPLOYES_CONFIG).length;
    
    if (needsRender) {
        container.innerHTML = '';
        for (const [key, config] of Object.entries(EMPLOYES_CONFIG)) {
            const div = document.createElement('div');
            div.id = 'employe-' + key;
            container.appendChild(div);
        }
    }
    
    for (const [key, config] of Object.entries(EMPLOYES_CONFIG)) {
        const div = document.getElementById('employe-' + key);
        if (!div) continue;
        
        const count = (GAME_STATE.employes && GAME_STATE.employes[key]) || 0;
        const isRecruited = count >= 1;
        
        if (niveauActuel >= config.niveauRequis) {
            div.className = 'character-item active-character';
            
            const currentPrice = config.cout;
            const canAfford = GAME_STATE.argent >= currentPrice;
            
            if (div.dataset.rendered !== 'active') {
                div.dataset.rendered = 'active';
                div.innerHTML = `
                    <div class="item-header">
                        <span class="item-name">${config.icon} ${t(config.nom)}</span>
                        <span class="item-level emp-status"></span>
                    </div>
                    <div class="item-progress-container" style="justify-content: flex-end;">
                        <button type="button" class="btn-action btn-recruit" data-type="${key}" style="padding: 5px 10px; font-size: 0.8em;">${t("Recruter")}</button>
                    </div>
                    <div class="item-price">${t("Prix : ")}<span class="emp-price"></span> $</div>
                `;
                
                const btn = div.querySelector('.btn-recruit');
                btn.addEventListener('click', (e) => {
                    const type = e.currentTarget.getAttribute('data-type');
                    if (recruterEmploye(type)) {
                        updateUI();
                    }
                });
            }
            
            const statusEl = div.querySelector('.emp-status');
            const btn = div.querySelector('.btn-recruit');
            const priceEl = div.querySelector('.item-price');
            
            if (isRecruited) {
                if (statusEl) {
                    statusEl.textContent = t("Recruté ✓");
                    statusEl.style.color = "var(--primary-color)";
                }
                if (btn) btn.style.display = 'none';
                if (priceEl) priceEl.style.display = 'none';
            } else {
                if (statusEl) {
                    statusEl.textContent = t("Disponible");
                    statusEl.style.color = "#aaa";
                }
                if (btn) {
                    btn.style.display = 'block';
                    btn.disabled = !canAfford;
                }
                if (priceEl) {
                    priceEl.style.display = 'block';
                    priceEl.style.color = canAfford ? 'inherit' : 'var(--danger-color)';
                    const numEl = priceEl.querySelector('.emp-price');
                    if (numEl) numEl.textContent = currentPrice.toLocaleString();
                }
            }
            
        } else {
            div.className = 'character-item locked';
            if (div.dataset.rendered !== 'locked') {
                div.dataset.rendered = 'locked';
                div.innerHTML = `
                    <span class="item-name">${config.icon} ${t(config.nom)}</span>
                    <span class="lock-icon">🔒 ${t("Niveau ")}${config.niveauRequis}</span>
                `;
            }
        }
    }
}
function updateGameSizesUI() {
    const sizeOptions = document.querySelectorAll('.size-option');
    if (!sizeOptions || sizeOptions.length === 0) return;
    
    const niveauActuel = GAME_STATE.niveauStudio || 1;
    const sizes = [
        { value: 'Indé', req: 1 },
        { value: 'Petit', req: 2 },
        { value: 'AA', req: 3 },
        { value: 'AAA', req: 4 },
        { value: 'AAAA', req: 5 }
    ];
    
    sizeOptions.forEach(label => {
        const input = label.querySelector('input');
        if (!input) return;
        
        const sizeConfig = sizes.find(s => s.value === input.value);
        if (!sizeConfig) return;
        
        if (niveauActuel >= sizeConfig.req) {
            label.classList.remove('locked');
            label.title = '';
            input.disabled = false;
            
            // Check if it should say locked or ticked
            label.innerHTML = `<input type="radio" name="game-size" value="${input.value}" ${input.checked ? 'checked' : ''}> ${t(input.value)}`;
        } else {
            label.classList.add('locked');
            label.title = t('Nécessite le niveau ') + sizeConfig.req + ' ' + t('de studio');
            input.disabled = true;
            input.checked = false;
            label.innerHTML = `<input type="radio" name="game-size" value="${input.value}" disabled> ${t(input.value)} 🔒`;
        }
    });
    
    // Ensure at least one is checked
    const checked = document.querySelector('input[name="game-size"]:checked');
    if (!checked) {
        document.querySelector('input[name="game-size"][value="Indé"]').checked = true;
    }
    
    // Update active class
    sizeOptions.forEach(label => {
        const input = label.querySelector('input');
        if (input && input.checked) {
            label.classList.add('active');
        } else {
            label.classList.remove('active');
        }
    });
}
