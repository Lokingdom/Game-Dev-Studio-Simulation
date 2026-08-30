import { t } from './i18n.js';
import { CONSTANTS, GAME_STATE, getInitialGameState, SUJETS_CONFIG, GENRES_CONFIG, PLATEFORMES_CONFIG, PUBLICITE_CONFIG, EMPLOYES_CONFIG , PRIX_AMELIORATION_PERSONNAGE, MAX_NIVEAU_PERSONNAGE, PRIX_AMELIORATION_MOTEUR, MAX_NIVEAU_MOTEUR, STUDIO_LEVELS_CONFIG } from './data.js';
import { updateUI, addEventLog } from './main.js';

let gameLoopInterval = null;

export function startGameLoop() {
    if (gameLoopInterval) clearInterval(gameLoopInterval);
    gameLoopInterval = setInterval(() => {
        try {
            calculerSalairesEmployes();
            updateDevelopment();
            updateStudio();
            updateVentes();
            updateUI();
            saveGame();
        } catch(e) {
            console.error("Game loop error:", e);
            const el = document.getElementById('active-game-title');
            if(el) el.innerHTML += '<div style="color:red;font-size:12px;">Loop error: ' + e.message + '</div>';
        }
    }, 1000);
}

export function calculerSalairesEmployes() {
    if (!GAME_STATE.employes) return;
    
    let salaireTotal = 0;
    for (const [type, count] of Object.entries(GAME_STATE.employes)) {
        if (count > 0 && EMPLOYES_CONFIG[type]) {
            salaireTotal += count * EMPLOYES_CONFIG[type].salaire;
        }
    }
    // Salaires ne sont plus deduits pour que le joueur ne perde jamais d'argent
    GAME_STATE.salairesEmployesParSeconde = 0; 
}

export function calculerPrixRecrutement(type) {
    const config = EMPLOYES_CONFIG[type];
    if (!config) return Infinity;
    const count = (GAME_STATE.employes && GAME_STATE.employes[type]) || 0;
    if (count >= 1) return Infinity; // Déjà recruté
    return config.cout;
}

export function recruterEmploye(type) {
    const count = (GAME_STATE.employes && GAME_STATE.employes[type]) || 0;
    if (count >= 1) return false;
    
    const prix = calculerPrixRecrutement(type);
    if (prix === Infinity) return false;
    
    if (GAME_STATE.argent >= prix) {
        GAME_STATE.argent -= prix;
        if (!GAME_STATE.employes) GAME_STATE.employes = {};
        GAME_STATE.employes[type] = 1;
        
        calculerSalairesEmployes();
        
        const nomEmploye = EMPLOYES_CONFIG[type].nom;
        addEventLog(`👨‍💻 ${nomEmploye} ` + t("recruté !"));
        
        saveGame();
        updateUI();
        return true;
    }
    return false;
}

export function calculerDifficulteGenre(genreNom, taille = "Indé") {
    // Le jeu indé est sur 20, AA sur 100, AAA sur 500, AAAA sur 1000
    if (taille === "Indé") return 20;
    if (taille === "Petit") return 50;
    if (taille === "AA") return 100;
    if (taille === "AAA") return 500;
    if (taille === "AAAA") return 1000;
    
    // Fallback original
    const genre = GENRES_CONFIG.find(g => g.nom === genreNom);
    return genre ? genre.pointsNecessaires : 20;
}

export function calculerQualiteMoteur(niveau) {
    return Math.floor(Math.random() * 11) + 5 + (niveau * 5);
}

export function createGame() {
    addEventLog("createGame triggered!");
    try {
    const nameInput = document.getElementById('game-name').value.trim();
    const genreSelect = document.getElementById('game-genre').value;
    const subjectSelect = document.getElementById('game-subject').value;
    const platformSelect = document.getElementById('game-platform').value || 'PC';
    const sizeRadio = document.querySelector('input[name="game-size"]:checked');
    const errorText = document.getElementById('create-error');
    if (!nameInput) {
        if(errorText) errorText.textContent = t("Erreur : Le jeu doit avoir un nom.");
        return;
    }
    if (!genreSelect) {
        if(errorText) errorText.textContent = t("Erreur : Vous devez choisir un genre.");
        return;
    }
    if (!subjectSelect) {
        if(errorText) errorText.textContent = t("Erreur : Vous devez choisir un sujet.");
        return;
    }
    if (!platformSelect) {
        if(errorText) errorText.textContent = t("Erreur : Vous devez choisir une plateforme.");
        return;
    }
    if (!sizeRadio) {
        if(errorText) errorText.textContent = t("Erreur : Vous devez choisir une taille de jeu.");
        return;
    }
    
    if(errorText) errorText.textContent = "";
    
    const sizeSelect = sizeRadio.value;


    if (GAME_STATE.jeuEnDeveloppement) {
        addEventLog(t("Un jeu est déjà en développement."));
        return;
    }

    const sujetInfo = SUJETS_CONFIG.find(s => s.nom === subjectSelect);
    const bonus = sujetInfo ? (sujetInfo.bonus || {}) : {};

    const genreInfo = GENRES_CONFIG.find(g => g.nom === genreSelect);

    
    if (!GAME_STATE.moteurJeu) GAME_STATE.moteurJeu = { scenario: 1, gameplay: 1, graphisme: 1, son: 1, longevite: 1 };
    const baseScenario = calculerQualiteMoteur(GAME_STATE.moteurJeu.scenario);

    const baseGameplay = calculerQualiteMoteur(GAME_STATE.moteurJeu.gameplay);
    const baseGraphisme = calculerQualiteMoteur(GAME_STATE.moteurJeu.graphisme);
    const baseSon = calculerQualiteMoteur(GAME_STATE.moteurJeu.son);
    const baseLongevite = calculerQualiteMoteur(GAME_STATE.moteurJeu.longevite);

    const marketingCheckboxes = document.querySelectorAll('input[name="game-marketing"]:checked');
    let marketingCost = 0;
    let marketingBoost = 1.0;
    let marketingSelection = [];

    marketingCheckboxes.forEach(cb => {
        if (cb.value === 'trailer') { marketingCost += 2000; marketingBoost += 0.1; marketingSelection.push('trailer'); }
        else if (cb.value === 'social') { marketingCost += 10000; marketingBoost += 0.2; marketingSelection.push('social'); }
        else if (cb.value === 'press') { marketingCost += 50000; marketingBoost += 0.5; marketingSelection.push('press'); }
        else if (cb.value === 'tv') { marketingCost += 100000; marketingBoost += 1.0; marketingSelection.push('tv'); }
    });

    if (GAME_STATE.argent < marketingCost) {
        if(errorText) errorText.textContent = t("Erreur : Fonds insuffisants pour le marketing.");
        return;
    }
    GAME_STATE.argent -= marketingCost;
    const marketingVal = marketingSelection.join(',');

    const qualites = {
        scenario: Math.max(0, Math.min(100, baseScenario + (bonus.scenario || 0))),
        gameplay: Math.max(0, Math.min(100, baseGameplay + (bonus.gameplay || 0))),
        graphisme: Math.max(0, Math.min(100, baseGraphisme + (bonus.graphisme || 0))),
        son: Math.max(0, Math.min(100, baseSon + (bonus.son || 0))),
        longevite: Math.max(0, Math.min(100, baseLongevite + (bonus.longevite || 0)))
    };
    
    const moteurUtilise = { ...GAME_STATE.moteurJeu };

    
    const reglages = {
        scenarioMissions: parseInt(document.getElementById('slider-scenario-missions')?.value || 5, 10),
        graphismesGameplay: parseInt(document.getElementById('slider-graphismes-gameplay')?.value || 5, 10),
        facileDifficile: parseInt(document.getElementById('slider-facile-difficile')?.value || 5, 10),
        atmosphereMecaniques: parseInt(document.getElementById('slider-atmosphere-mecaniques')?.value || 5, 10)
    };

    const newGame = {
        id: Date.now(),
        nom: nameInput,
        genre: genreSelect,
        sujet: subjectSelect,
        plateforme: platformSelect,
        taille: sizeSelect,
        qualites: qualites,
        moteurUtilise: moteurUtilise,
        genreInfos: genreInfo || { nom: genreSelect, difficulte: 1, multiplicateurRevenus: 1, bonusReputation: 0, pointsNecessaires: 20 },
        caracteristiques: { 
            scenario: Math.min(Math.ceil((GAME_STATE.niveauMoteur || 1) / 2), 1 + (GAME_STATE.employes?.scenariste ? 4 : 0)), 
            gameplay: Math.min(Math.ceil((GAME_STATE.niveauMoteur || 1) / 2), 1 + (GAME_STATE.employes?.gameDesigner ? 4 : 0)), 
            graphismes: Math.min(Math.ceil((GAME_STATE.niveauMoteur || 1) / 2), 1 + (GAME_STATE.employes?.artiste ? 4 : 0)), 
            sons: Math.min(Math.ceil((GAME_STATE.niveauMoteur || 1) / 2), 1 + (GAME_STATE.employes?.soundDesigner ? 4 : 0)), 
            dureeVie: Math.min(Math.ceil((GAME_STATE.niveauMoteur || 1) / 2), 5) 
        },
        progression: 0,
        pointsNecessaires: calculerDifficulteGenre(genreSelect, sizeSelect),
        statut: "developpement",
        hype: 0,
        budgetPublicite: 0,
        reglages: reglages,
        marketingVal: marketingVal,
        marketingBoost: marketingBoost
    };
    
    const modal = document.getElementById('create-game-modal');
    if(modal) modal.style.display = 'none';


    GAME_STATE.jeuEnDeveloppement = newGame;
    addEventLog(t("Le développement de ") + newGame.nom + t(" commence !"));
    
    // Vider le champ
    document.getElementById('game-name').value = "";
    
    verifierDeblocages();
    updateUI();
    updateUI();
    const _modal = document.getElementById('create-game-modal');
    if (_modal) _modal.style.display = 'none';


    } catch(e) { addEventLog("Error: " + e.message); console.error(e); }
}

export function calculerPrixAmeliorationCaracteristique(niveauActuel) {
    const prix = {
        1: 100,
        2: 250,
        3: 500,
        4: 1000
    };
    return prix[niveauActuel] || Infinity;
}

export function ameliorerCaracteristique(caracteristique) {
    const jeu = GAME_STATE.jeuEnDeveloppement;
    if (!jeu || jeu.statut !== "preparation") return false;
    if (!jeu.caracteristiques || !jeu.caracteristiques[caracteristique]) return false;
    
    const niveauActuel = jeu.caracteristiques[caracteristique];
    if (niveauActuel >= 5) return false;
    
    let employeBonus = 0;
    if (GAME_STATE.employes) {
        if (caracteristique === 'scenario' && GAME_STATE.employes.scenariste) employeBonus = 4;
        if (caracteristique === 'gameplay' && GAME_STATE.employes.gameDesigner) employeBonus = 4;
        if (caracteristique === 'graphismes' && GAME_STATE.employes.artiste) employeBonus = 4;
        if (caracteristique === 'sons' && GAME_STATE.employes.soundDesigner) employeBonus = 4;
    }
    
    let maxParEmployes = 1 + employeBonus;
    if (caracteristique === 'dureeVie') {
        maxParEmployes = 5; 
    }
    
    const limiteMoteur = Math.ceil((GAME_STATE.niveauMoteur || 1) / 2);
    const limiteAbsolue = Math.min(limiteMoteur, maxParEmployes);
    
    if (niveauActuel >= limiteAbsolue) {
        if (niveauActuel >= limiteMoteur) {
            addEventLog(t("Votre moteur ne permet pas d'améliorer ceci plus haut."));
        } else {
            addEventLog(t("Recrutez un spécialiste pour dépasser le niveau ") + niveauActuel + ".");
        }
        return false;
    }
    
    const prix = calculerPrixAmeliorationCaracteristique(niveauActuel);
    if (GAME_STATE.argent >= prix) {
        GAME_STATE.argent -= prix;
        jeu.caracteristiques[caracteristique] += 1;
        saveGame();
        updateUI();
        return true;
    }
    return false;
}

export function acheterCampagnePublicitaire(type) {
    const jeu = GAME_STATE.jeuEnDeveloppement;
    if (!jeu || jeu.statut !== "preparation") return false;
    
    const campagne = PUBLICITE_CONFIG[type];
    if (!campagne) return false;
    
    if (GAME_STATE.argent >= campagne.cout) {
        GAME_STATE.argent -= campagne.cout;
        jeu.hype = Math.min(100, (jeu.hype || 0) + campagne.hype);
        jeu.budgetPublicite = (jeu.budgetPublicite || 0) + campagne.cout;
        
        addEventLog(`📢 ` + t("Campagne publicitaire lancée pour ") + `${jeu.nom} (+${campagne.hype} hype)`);
        
        saveGame();
        updateUI();
        return true;
    }
    return false;
}

export function commencerDeveloppement() {
    const jeu = GAME_STATE.jeuEnDeveloppement;
    if (!jeu || jeu.statut !== "preparation") return;
    
    jeu.statut = "developpement";
    addEventLog(t("Le développement de ") + `${jeu.nom} ` + t("a commencé."));
    updateUI();
    saveGame();
}


export function calculerCompatibiliteGenreSujet(genre, sujet) {
    const combos = {
        "MMORPG_Médiéval": 1.4,
        "MMORPG_Fantasy": 1.5,
        "RPG_Fantasy": 1.5,
        "RPG_Cyberpunk": 1.4,
        "Tir_Guerre": 1.5,
        "Tir_Espace": 1.4,
        "Horreur_Horreur": 1.5,
        "Sport_Sport": 1.5,
        "Course_Sport": 1.3,
        "Visual Novel_Détective": 1.5,
        "Clicker_Animaux": 1.4,
        "Réflexion_Animaux": 1.3,
        "Simulation_Espace": 1.4,
        "Stratégie_Guerre": 1.5,
        "Stratégie_Médiéval": 1.4,
        "Stratégie_Espace": 1.4,
        "Aventure_Pirates": 1.5,
        "Monde Ouvert_Super-héros": 1.5,
        "Monde Ouvert_Fantasy": 1.4,
        "Combat_Super-héros": 1.4,
        "Infiltration_Cyberpunk": 1.4,
        
        "Clicker_Guerre": 0.5,
        "Clicker_Horreur": 0.6,
        "Réflexion_Guerre": 0.6,
        "Sport_Fantasy": 0.7,
        "Course_Horreur": 0.6,
        "Visual Novel_Sport": 0.5,
        "MMORPG_Sport": 0.4
    };
    
    const key = genre + "_" + sujet;
    if (combos[key]) return combos[key];
    
    // Slight random variation between 0.9 and 1.1 for unmapped combos
    return 0.95 + (Math.random() * 0.15);
}

export function calculerNoteJeu(jeu) {
    // Calculer les caractéristiques maximales possibles basées sur le moteur et les employés
    const nivMoteur = GAME_STATE.niveauMoteur || 1;
    const limiteMoteur = Math.ceil(nivMoteur / 2); // De 1 à 5
    const emp = GAME_STATE.employes || {};
    
    const c = {
        scenario: Math.min(limiteMoteur, 1 + (emp.scenariste ? 4 : 0)),
        gameplay: Math.min(limiteMoteur, 1 + (emp.gameDesigner ? 4 : 0)),
        graphismes: Math.min(limiteMoteur, 1 + (emp.artiste ? 4 : 0)),
        sons: Math.min(limiteMoteur, 1 + (emp.soundDesigner ? 4 : 0)),
        dureeVie: Math.min(limiteMoteur, 5) // DureeVie n'a pas besoin d'employé
    };
    
    // Caractéristiques (5x5 = 25 max). Each point is worth 1.6 base score -> max 40
    let pointsCarac = (c.scenario + c.gameplay + c.graphismes + c.sons + c.dureeVie) * 1.6;
    
    // Personnage et Moteur (10 max each). Each point is worth 1.5 -> max 15 each
    let pointsPerso = (GAME_STATE.niveauPersonnage || 1) * 1.5;
    let pointsMoteur = (GAME_STATE.niveauMoteur || 1) * 1.5;
    
    let note = pointsCarac + pointsPerso + pointsMoteur; // Max: 40 + 15 + 15 = 70
    
    // Curseurs (max 15)
    if (jeu.reglages && jeu.genreInfos && jeu.genreInfos.reglagesOptimaux) {
        const opt = jeu.genreInfos.reglagesOptimaux;
        const reg = jeu.reglages;
        let bonus = 0;
        
        const checkCurseur = (val, cible) => {
            const diff = Math.abs(val - cible);
            if (diff === 0) return 3.75;
            if (diff === 1) return 2.0;
            if (diff === 2) return 0.5;
            return 0;
        };
        
        bonus += checkCurseur(reg.scenarioMissions || 5, opt.scenarioMissions);
        bonus += checkCurseur(reg.graphismesGameplay || 5, opt.graphismesGameplay);
        bonus += checkCurseur(reg.facileDifficile || 5, opt.facileDifficile);
        bonus += checkCurseur(reg.atmosphereMecaniques || 5, opt.atmosphereMecaniques);
        
        note += bonus;
    }
    
    // Compatibilité genre/sujet (1.0 -> 1.0, 1.5 -> 1.2)
    const compat = calculerCompatibiliteGenreSujet(jeu.genre, jeu.sujet); 
    const trueCompat = 1.0 + (compat - 1.0) * 0.4;
    note = note * trueCompat;
    
    // Pénalité de taille de jeu
    const expectedCaracs = {
        "Indé": 5, 
        "Petit": 10, 
        "AA": 15, 
        "AAA": 20, 
        "AAAA": 25 
    };
    const size = jeu.taille || "Indé";
    const expected = expectedCaracs[size] || 5;
    const actual = c.scenario + c.gameplay + c.graphismes + c.sons + c.dureeVie;
    
    if (actual < expected) {
        note -= (expected - actual) * 2;
    }
    
    // On limite la note brute (avant l'aléatoire final) à un certain seuil,
    // pour que l'excédent de points (ex: 110) n'absorbe pas la malus aléatoire.
    // Un jeu parfait plafonne à 97 avant l'aléatoire.
    note = Math.min(97, note);
    
    // Facteur aléatoire de -5 à +5 pour les notes, apportant du piment
    const randomFactor = (Math.random() * 10) - 5;
    note += randomFactor;
    
    return Math.max(1, Math.min(100, Math.round(note)));
}

export function ameliorerCaracteristiqueJeu(jeu, caracteristique) {
    if (!jeu || !jeu.caracteristiques || !jeu.caracteristiques[caracteristique]) return false;
    
    if (jeu.caracteristiques[caracteristique] < 5) {
        jeu.caracteristiques[caracteristique] += 1;
        return true;
    }
    return false;
}

function calculerDureeVente(note) {
    return 10 + Math.floor((note / 100) * 20);
}

export function calculerBonusHype(hype) {
    const h = hype || 0;
    let baseBonus = 1;
    if (h >= 80) baseBonus = 2;
    else if (h >= 60) baseBonus = 1.5;
    else if (h >= 40) baseBonus = 1.25;
    else if (h >= 20) baseBonus = 1.1;
    
    if (GAME_STATE.employes && GAME_STATE.employes.marketing && baseBonus > 1) {
        const bonusMarket = EMPLOYES_CONFIG.marketing.bonusValeur / 100;
        baseBonus += bonusMarket;
    }
    
    return baseBonus;
}

function calculerRevenu(note, genreInfos, hype, taille = "Indé", plateforme = "PC") {
    const base = 1 + Math.floor((note / 100) * 49);
    const mult = genreInfos ? (genreInfos.multiplicateurRevenus || 1) : 1;
    const bonusHype = calculerBonusHype(hype);
    
    const tailleMults = {
        "Indé": 1,
        "Petit": 3,
        "AA": 10,
        "AAA": 40,
        "AAAA": 150
    };
    
    let multTaille = tailleMults[taille] || 1;
    
    if (note < 30) {
        if (taille === "Indé") {
            multTaille = 1; 
        } else {
            // Formule mathématique pour punir les gros jeux en dessous de 30
            // Ils rapportent moins ou pareil qu'un jeu indé
            multTaille = Math.max(0.1, Math.pow(note / 30, 2)); 
        }
    } else {
        // Optionnel : un jeu très bien noté et grand profite d'un boost supplémentaire ?
        // On reste sur la formule de base pour pas trop exploser la difficulté,
        // multTaille scale déjà massivement (x3, x10, x40...).
    }
    
        let multPlateforme = 1;
    if (typeof PLATEFORMES_CONFIG !== 'undefined') {
        const platConf = PLATEFORMES_CONFIG.find(p => p.nom === plateforme);
        if (platConf) {
            multPlateforme = platConf.multiplicateurRevenus || 1;
        }
    }
    return Math.floor(base * mult * bonusHype * multTaille * multPlateforme);
}

export function calculerPrixAmelioration(niveau) {
    return Math.floor(100 * Math.pow(1.5, niveau));
}

export function calculerVitesseDeveloppement() {
    let vitesse = GAME_STATE.niveauPersonnage || 1;
    let bonusMoteur = (GAME_STATE.niveauMoteur || 1) - 1;
    vitesse += bonusMoteur;
    if (GAME_STATE.employes && GAME_STATE.employes.developpeur) {
        vitesse += 1;
    }
    return isNaN(vitesse) ? 1 : Math.max(0.1, vitesse);
}




export function getMaxLevelAllowed() {
    return Math.min(10, (GAME_STATE.niveauStudio || 1) * 2 + 1);
}

export function calculerPrixPersonnage(niveauActuel) {
    if (niveauActuel >= getMaxLevelAllowed()) return Infinity;
    return PRIX_AMELIORATION_PERSONNAGE[niveauActuel] || Infinity;
}

export function ameliorerPersonnage() {
    if (!GAME_STATE.niveauPersonnage) GAME_STATE.niveauPersonnage = 1;
    const niveau = GAME_STATE.niveauPersonnage;
    if (niveau >= getMaxLevelAllowed()) return;
    
    const prix = calculerPrixPersonnage(niveau);
    if (GAME_STATE.argent >= prix) {
        GAME_STATE.argent -= prix;
        GAME_STATE.niveauPersonnage++;
        saveGame();
    }
}

export function calculerPrixMoteur(niveauActuel) {
    if (niveauActuel >= getMaxLevelAllowed()) return Infinity;
    return PRIX_AMELIORATION_MOTEUR[niveauActuel] || Infinity;
}

export function ameliorerMoteurUnique() {
    if (!GAME_STATE.niveauMoteur) GAME_STATE.niveauMoteur = 1;
    const niveau = GAME_STATE.niveauMoteur;
    if (niveau >= getMaxLevelAllowed()) return;
    
    const prix = calculerPrixMoteur(niveau);
    if (GAME_STATE.argent >= prix) {
        GAME_STATE.argent -= prix;
        GAME_STATE.niveauMoteur++;
        saveGame();
    }
}


export function calculerPrixAmeliorationMoteur(niveau) {
    return Math.floor(500 * Math.pow(2, niveau - 1));
}

export function ameliorerMoteur() {
    if (!GAME_STATE.moteurStudio) {
        GAME_STATE.moteurStudio = getInitialMoteur();
    }
    
    const prix = calculerPrixAmeliorationMoteur(GAME_STATE.moteurStudio.niveau);
    if (GAME_STATE.argent >= prix) {
        GAME_STATE.argent -= prix;
        GAME_STATE.moteurStudio.niveau += 1;
        
        // Améliorer les limites du moteur
        for (let carac in GAME_STATE.moteurStudio.caracteristiques) {
            if (GAME_STATE.moteurStudio.caracteristiques[carac] < 5) {
                GAME_STATE.moteurStudio.caracteristiques[carac] += 1;
            }
        }
        
        saveGame();
        updateUI();
        return true;
    }
    return false;
}

export function updateDevelopment() {
    try {
        
    const jeu = GAME_STATE.jeuEnDeveloppement;
    if (!jeu) return;
    
    // Fallback if missing
    if (!jeu.pointsNecessaires) {
        jeu.pointsNecessaires = calculerDifficulteGenre(jeu.genre || "Action", jeu.taille || "Indé");
    }

    if (jeu.statut === "developpement") {
        let vitesse = calculerVitesseDeveloppement();
        if (isNaN(vitesse) || isNaN(jeu.progression)) {
            jeu.progression = 0;
            vitesse = 1;
        }
        jeu.progression += vitesse;
        
        if (jeu.progression >= jeu.pointsNecessaires) {
            jeu.statut = "notation";
            jeu.progression = jeu.pointsNecessaires;
            jeu.note = calculerNoteJeu(jeu);
            let rech = Math.floor(jeu.note / 5);
            if (jeu.genreInfos) {
                rech += (jeu.genreInfos.difficulte || 1) * 2;
            }
            jeu.rechercheGagnee = rech;
            jeu.scoreAffiche = 0; // For animation
        }
    } else if (jeu.statut === "notation") {
        // Animation handled by UI. Wait for user to click "Retour" to finish game.
    }

    } catch(e) { console.error('updateDevelopment error:', e); const el = document.getElementById('active-game-title'); if(el) el.innerHTML += '<div style="color:red;font-size:12px;">' + e.message + '</div>'; }
}
export function finishGame() {
    const jeu = GAME_STATE.jeuEnDeveloppement;
    if (!jeu) return;
    
    if (jeu.note === undefined) jeu.note = calculerNoteJeu(jeu);
    
    const revenuPS = Math.floor(calculerRevenu(jeu.note, jeu.genreInfos, jeu.hype, jeu.taille, jeu.plateforme));
    // Démarrage fort puis dégressif
    jeu.revenuPSActuel = Math.max(10, revenuPS * 2) * (jeu.marketingBoost || 1.0);
    jeu.argentTotalGagne = 0;
    
    // Réputation
    let repGagnee = 1;
    if (jeu.note >= 80) repGagnee = 5;
    else if (jeu.note >= 50) repGagnee = 3;
    
    const bonusGenre = jeu.genreInfos ? (jeu.genreInfos.bonusReputation || 0) : 0;
    repGagnee += bonusGenre;
    
    const h = jeu.hype || 0;
    let bonusHype = 0;
    if (h >= 80) bonusHype = 3;
    else if (h >= 60) bonusHype = 2;
    else if (h >= 20) bonusHype = 1;
    repGagnee += bonusHype;
    
    jeu.reputationGagnee = repGagnee;
    GAME_STATE.reputationStudio = (GAME_STATE.reputationStudio || 0) + repGagnee;
    
    GAME_STATE.jeuxCrees += 1;
    
    // Gain de points de recherche basé sur la note du jeu et sa difficulté
    

    addEventLog(`${jeu.nom} ` + t("est sorti ! Note : ") + `${jeu.note}/100. ` + t("En vente maintenant !"));
    
    if (!GAME_STATE.meilleurScore || jeu.note > GAME_STATE.meilleurScore) {
        GAME_STATE.meilleurScore = jeu.note;
        GAME_STATE.meilleurJeu = jeu.nom;
    }
    
    if (!GAME_STATE.feedbackCurseurs) GAME_STATE.feedbackCurseurs = {};
    if (!GAME_STATE.feedbackCurseurs[jeu.genre]) GAME_STATE.feedbackCurseurs[jeu.genre] = {};

    const genreInfo = GENRES_CONFIG.find(g => g.nom === jeu.genre);
    if (genreInfo && genreInfo.reglagesOptimaux && jeu.reglages) {
        for (const [cle, val] of Object.entries(jeu.reglages)) {
            if (!GAME_STATE.feedbackCurseurs[jeu.genre][cle]) {
                GAME_STATE.feedbackCurseurs[jeu.genre][cle] = {};
            }
            const isOptimal = (genreInfo.reglagesOptimaux[cle] === val);
            GAME_STATE.feedbackCurseurs[jeu.genre][cle][val] = isOptimal ? "vert" : "rouge";
        }
    }

    if (!GAME_STATE.jeuxEnVente) GAME_STATE.jeuxEnVente = [];
    GAME_STATE.jeuxEnVente.push({...jeu});
    
    GAME_STATE.jeuEnDeveloppement = null;
    verifierDeblocages();
    saveGame();
}

export function saveGame() {
    try {
        const dataToSave = JSON.stringify(GAME_STATE);
        localStorage.setItem(CONSTANTS.SAVE_KEY, dataToSave);
    } catch (error) {
        console.error("Erreur lors de la sauvegarde :", error);
    }
}


export function ameliorerStudio() {
    const niveauActuel = GAME_STATE.niveauStudio || 1;
    if (niveauActuel >= 5) return false;
    if (GAME_STATE.studioAmeliorationEnCours) return false;
    
    const nextLevel = niveauActuel + 1;
    const config = STUDIO_LEVELS_CONFIG[nextLevel];
    if (!config) return false;
    
    if (GAME_STATE.argent >= config.prix) {
        GAME_STATE.argent -= config.prix;
        
        // Start upgrade process
        GAME_STATE.studioAmeliorationEnCours = true;
        GAME_STATE.studioAmeliorationDebut = Date.now();
        // 30 seconds to upgrade
        GAME_STATE.studioAmeliorationDuree = 30000;
        GAME_STATE.studioAmeliorationNiveauCible = nextLevel;
        GAME_STATE.studioAmeliorationNomCible = config.nom + " " + GAME_STATE.nomFondateur;
        GAME_STATE.studioAmeliorationProgress = 0;
        
        addEventLog(t("Début des travaux d'amélioration du studio vers le niveau ") + nextLevel + "...");
        
        saveGame();
        updateUI();
        return true;
    }
    return false;
}

export function loadGame() {
    try {
        const savedData = localStorage.getItem(CONSTANTS.SAVE_KEY);
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            
            const initialState = getInitialGameState();
            const mergedState = { ...initialState, ...parsedData };
            // Migration des noms de genres en français
            const genreTranslation = {
                "Puzzle": "Réflexion",
                "Platformer": "Plateforme",
                "Racing": "Course",
                "Sports": "Sport",
                "Shooter": "Tir",
                "Fighting": "Combat",
                "Strategy": "Stratégie",
                "Horror": "Horreur",
                "Stealth": "Infiltration",
                "Adventure": "Aventure",
                "Open World": "Monde Ouvert"
            };
            
            if (mergedState.genresDebloques) {
                mergedState.genresDebloques = mergedState.genresDebloques.map(g => genreTranslation[g] || g);
            }
            if (mergedState.jeuEnDeveloppement && mergedState.jeuEnDeveloppement.genre) {
                mergedState.jeuEnDeveloppement.genre = genreTranslation[mergedState.jeuEnDeveloppement.genre] || mergedState.jeuEnDeveloppement.genre;
            }
            if (mergedState.historiqueJeux) {
                mergedState.historiqueJeux.forEach(j => {
                    if (j.genre) j.genre = genreTranslation[j.genre] || j.genre;
                });
            }
            if (mergedState.historique) {
                mergedState.historique.forEach(j => {
                    if (j.genre) j.genre = genreTranslation[j.genre] || j.genre;
                });
            }

            
            const ensureQualites = (jeu) => {
                if (jeu) {
                    if (!jeu.qualites) {
                        jeu.qualites = { scenario: 50, gameplay: 50, graphisme: 50, son: 50, longevite: 50 };
                    }
                    if (!jeu.genreInfos) {
                        jeu.genreInfos = { nom: jeu.genre, difficulte: 1, multiplicateurRevenus: 1, bonusReputation: 0, pointsNecessaires: 20 };
                    }
                    if (!jeu.caracteristiques) {
                        jeu.caracteristiques = { scenario: 1, gameplay: 1, graphismes: 1, sons: 1, dureeVie: 1 };
                    }
                    if (jeu.hype === undefined) jeu.hype = 0;
                    if (jeu.budgetPublicite === undefined) jeu.budgetPublicite = 0;
                }
            };
            
            if (mergedState.jeuEnDeveloppement) {
                ensureQualites(mergedState.jeuEnDeveloppement);
            }
            if (mergedState.historique) {
                mergedState.historique.forEach(ensureQualites);
            }
            
            if (!mergedState.jeuxEnVente) mergedState.jeuxEnVente = [];
            if (!mergedState.employes) {
    mergedState.employes = {
        developpeur: 0,
        gameDesigner: 0,
        artiste: 0,
        soundDesigner: 0,
        scenariste: 0,
        marketing: 0
    };
} else {
    // Normaliser les compteurs à 1 max
    for (let key in mergedState.employes) {
        if (mergedState.employes[key] > 1) {
            mergedState.employes[key] = 1;
        }
    }
}
if (mergedState.salairesEmployesParSeconde === undefined) {
                mergedState.salairesEmployesParSeconde = 0;
            }
            
            if (!mergedState.moteurJeu) {
                mergedState.moteurJeu = { scenario: 1, gameplay: 1, graphisme: 1, son: 1, longevite: 1 };
            }
            if (!mergedState.niveauPersonnage) mergedState.niveauPersonnage = 1;
            if (!mergedState.niveauMoteur) mergedState.niveauMoteur = 1;
            if (!mergedState.moteurStudio) {
                mergedState.moteurStudio = getInitialMoteur();
            }
            
            if (!mergedState.genresDebloques) {
                mergedState.genresDebloques = ["Clicker", "Réflexion", "Plateforme"];
            }
            if (!mergedState.sujetsDebloques) {
                mergedState.sujetsDebloques = ["Fantasy", "Guerre", "Animaux"];
            }
            
            for (let key in GAME_STATE) {
                delete GAME_STATE[key];
            }
            Object.assign(GAME_STATE, mergedState);
            calculerSalairesEmployes();
            
            return true;
        }
    } catch (error) {
        console.error("Erreur lors du chargement :", error);
    }
    return false;
}

export function resetGame() {
    localStorage.removeItem(CONSTANTS.SAVE_KEY);
    window.location.reload();
}

export function startAutoSave(intervalMs = 30000) {
    setInterval(() => {
        saveGame();
    }, intervalMs);
}

export function verifierDeblocages() {
    // Unlocking is now manual via Research UI
}

export function rechercherGenre(nom) {
    const genre = GENRES_CONFIG.find(g => g.nom === nom);
    if (!genre) return false;
    if (GAME_STATE.genresDebloques.includes(nom)) return false;
    
    GAME_STATE.genresDebloques.push(nom);
    addEventLog(t("Débloqué : Genre ") + `"${t(nom)}"`);
    saveGame();
    return true;
}

export function rechercherSujet(nom) {
    const sujet = SUJETS_CONFIG.find(s => s.nom === nom);
    if (!sujet) return false;
    if (GAME_STATE.sujetsDebloques.includes(nom)) return false;
    
    GAME_STATE.sujetsDebloques.push(nom);
    addEventLog(t("Débloqué : Sujet ") + `"${t(nom)}"`);
    saveGame();
    return true;
}

export function rechercherPlateforme(nom) {
    const plat = PLATEFORMES_CONFIG.find(p => p.nom === nom);
    if (!plat) return false;
    if (GAME_STATE.plateformesDebloquees.includes(nom)) return false;
    
    if (nom === "Toutes les plateformes") {
        if (!GAME_STATE.plateformesDebloquees.includes("Mobile") || !GAME_STATE.plateformesDebloquees.includes("Consoles")) {
            addEventLog(t("Vous devez d'abord débloquer Mobile et Consoles !"));
            return false;
        }
    }
    if (nom === "VR") {
        if (!GAME_STATE.plateformesDebloquees.includes("Toutes les plateformes")) {
            addEventLog(t("La VR est un bonus, vous devez débloquer 'Toutes les plateformes' d'abord !"));
            return false;
        }
    }

    GAME_STATE.plateformesDebloquees.push(nom);
    addEventLog(t("Débloqué : Plateforme ") + `"${t(nom)}"`);
    saveGame();
    return true;
}


export function updateVentes() {
    if (!GAME_STATE.jeuxEnVente) GAME_STATE.jeuxEnVente = [];
    if (!GAME_STATE.historique) GAME_STATE.historique = [];
    
    for (let i = GAME_STATE.jeuxEnVente.length - 1; i >= 0; i--) {
        let jeu = GAME_STATE.jeuxEnVente[i];
        
        let gains = Math.floor(jeu.revenuPSActuel);
        if (gains < 0) gains = 0;
        
        GAME_STATE.argent += gains;
        jeu.argentTotalGagne = (jeu.argentTotalGagne || 0) + gains;
        GAME_STATE.argentTotalGagne = (GAME_STATE.argentTotalGagne || 0) + gains;
        
        // Decay the revenue
        jeu.revenuPSActuel = jeu.revenuPSActuel * 0.95; // Baisse de 5% par seconde
        
        // If revenue drops too low, remove from sale and put in historique
        if (jeu.revenuPSActuel < 1) {
            GAME_STATE.jeuxEnVente.splice(i, 1);
            GAME_STATE.historique.push({...jeu});
            if (GAME_STATE.historique.length > CONSTANTS.MAX_HISTORIQUE) {
                GAME_STATE.historique.shift();
            }
        }
    }
}

export function updateStudio() {
    if (GAME_STATE.studioAmeliorationEnCours) {
        if (!GAME_STATE.studioAmeliorationDebut) GAME_STATE.studioAmeliorationDebut = Date.now();
        const elapsed = Date.now() - GAME_STATE.studioAmeliorationDebut;
        const progress = Math.min((elapsed / GAME_STATE.studioAmeliorationDuree) * 100, 100);
        
        GAME_STATE.studioAmeliorationProgress = progress;
        
        if (progress >= 100) {
            GAME_STATE.studioAmeliorationEnCours = false;
            GAME_STATE.niveauStudio = GAME_STATE.studioAmeliorationNiveauCible;
            // GAME_STATE.nomStudio = GAME_STATE.studioAmeliorationNomCible; // Ne pas écraser le nom du studio
            addEventLog(t("Le studio a été amélioré au niveau ") + GAME_STATE.niveauStudio + " !");
            saveGame();
            updateUI();
        }
    }
}
