export function updateUI() { try {
    updateDOM();
    populateDropdowns();

    // Change le fond d'écran en fonction du niveau du studio (max 5)
    let bgLevel = Math.min(GAME_STATE.niveauStudio || 1, 5);
    const expectedFilename = "/assets/bg_level" + bgLevel + "_v4.png";
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

    // ... rest of updateUI unchanged (kept in file but omitted here for brevity) 
} catch(e) { console.error('updateUI error:', e); const el = document.getElementById('active-game-title'); if(el) el.innerHTML += '<div style="color:red;font-size:12px;">' + e.message + '</di'; }
