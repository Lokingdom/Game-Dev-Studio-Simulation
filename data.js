export const CONSTANTS = {
    TICKS_PAR_SECONDE: 10,
    ARGENT_INITIAL: 1000,
    COUT_BASE_JEU: 50,
    COUT_MOTEUR_BASE: 100,
    NOM_DU_STUDIO_PAR_DEFAUT: "Mon Super Studio"
};

export const MAX_NIVEAU_MOTEUR = 10;
export const CARACTERISTIQUES_MOTEUR = [
    "scenario",
    "gameplay",
    "graphismes",
    "sons",
    "dureeVie"
];
export const MAX_NIVEAU_CARACTERISTIQUE = 5;
export const CARACTERISTIQUES_JEU = [
    "scenario",
    "gameplay",
    "graphismes",
    "sons",
    "dureeVie"
];
export const GENRES_JEU = [
    "Clicker",
    "Réflexion",
    "Plateforme",
    "Visual Novel",
    "RPG",
    "Course",
    "Sport",
    "Tir",
    "Combat",
    "Stratégie",
    "Simulation",
    "Horreur",
    "Infiltration",
    "Aventure",
    "Monde Ouvert",
    "MMORPG"
];
export const PLATEFORMES_CONFIG = [
    { nom: "PC", icon: "💻", coutRecherche: 0, multiplicateurRevenus: 1, difficulte: 1 },
    { nom: "Mobile", icon: "📱", coutRecherche: 20, multiplicateurRevenus: 1.5, difficulte: 1, conditionText: "Avoir créé au moins 5 jeux", condition: (historique) => historique.length >= 5 },
    { nom: "Consoles", icon: "🎮", coutRecherche: 50, multiplicateurRevenus: 2, difficulte: 1.5, conditionText: "Générer au moins 100 000$ au total", condition: (historique, gameState) => (gameState.argentTotalGagne || 0) >= 100000 },
    { nom: "Toutes les plateformes", icon: "🌐", coutRecherche: 200, multiplicateurRevenus: 4, difficulte: 3, conditionText: "Générer au moins 2 000 000$ au total", condition: (historique, gameState) => (gameState.argentTotalGagne || 0) >= 2000000 },
    { nom: "VR", icon: "🥽", coutRecherche: 80, multiplicateurRevenus: 1.8, difficulte: 2, conditionText: "Studio Niv. 4 et 1 000 000$ générés", condition: (historique, gameState) => (gameState.niveauStudio || 1) >= 4 && (gameState.argentTotalGagne || 0) >= 1000000 }
];

export const GENRES_CONFIG = [
    { nom: "Clicker", icon: "🖱️", coutRecherche: 10, difficulte: 1, bonusReputation: 0, multiplicateurRevenus: 1, pointsNecessaires: 20 , reglagesOptimaux: {"scenarioMissions":9,"graphismesGameplay":4,"facileDifficile":2,"atmosphereMecaniques":7}},
    { nom: "Réflexion", icon: "🧩", coutRecherche: 10, difficulte: 2, bonusReputation: 1, multiplicateurRevenus: 1.2, pointsNecessaires: 40 , reglagesOptimaux: {"scenarioMissions":7,"graphismesGameplay":7,"facileDifficile":7,"atmosphereMecaniques":8}},
    { nom: "Plateforme", icon: "🏃", coutRecherche: 10, difficulte: 3, bonusReputation: 1, multiplicateurRevenus: 1.5, pointsNecessaires: 60 , reglagesOptimaux: {"scenarioMissions":7,"graphismesGameplay":6,"facileDifficile":6,"atmosphereMecaniques":6}},
    { nom: "Visual Novel", icon: "📖", coutRecherche: 15, difficulte: 5, bonusReputation: 2, multiplicateurRevenus: 1.5, pointsNecessaires: 100 , reglagesOptimaux: {"scenarioMissions":1,"graphismesGameplay":4,"facileDifficile":2,"atmosphereMecaniques":2}},
    { nom: "Course", icon: "🏎️", coutRecherche: 50, difficulte: 4, bonusReputation: 2, multiplicateurRevenus: 1.8, pointsNecessaires: 80 , reglagesOptimaux: {"scenarioMissions":8,"graphismesGameplay":3,"facileDifficile":5,"atmosphereMecaniques":8}, conditionText: "Sortir au moins 5 jeux", condition: (historique) => historique.length >= 5},
    { nom: "Sport", icon: "⚽", coutRecherche: 50, difficulte: 4, bonusReputation: 2, multiplicateurRevenus: 1.8, pointsNecessaires: 80 , reglagesOptimaux: {"scenarioMissions":9,"graphismesGameplay":3,"facileDifficile":5,"atmosphereMecaniques":8}, conditionText: "Sortir au moins 10 jeux", condition: (historique) => historique.length >= 10},
    { nom: "Horreur", icon: "👻", coutRecherche: 90, difficulte: 6, bonusReputation: 3, multiplicateurRevenus: 2.2, pointsNecessaires: 120 , reglagesOptimaux: {"scenarioMissions":3,"graphismesGameplay":3,"facileDifficile":7,"atmosphereMecaniques":2}, conditionText: "Sortir au moins 15 jeux", condition: (historique) => historique.length >= 15},
    { nom: "Tir", icon: "🔫", coutRecherche: 55, difficulte: 5, bonusReputation: 2, multiplicateurRevenus: 2, pointsNecessaires: 100 , reglagesOptimaux: {"scenarioMissions":6,"graphismesGameplay":2,"facileDifficile":7,"atmosphereMecaniques":7}, conditionText: "Sortir un jeu sur la Guerre (Note >= 70)", condition: (historique) => historique.some(j => j.sujet === "Guerre" && j.note >= 70) },
    { nom: "Stratégie", icon: "♟️", coutRecherche: 85, difficulte: 7, bonusReputation: 3, multiplicateurRevenus: 2.5, pointsNecessaires: 150 , reglagesOptimaux: {"scenarioMissions":6,"graphismesGameplay":7,"facileDifficile":8,"atmosphereMecaniques":7}, conditionText: "Sortir un jeu de Réflexion (Note >= 80)", condition: (historique) => historique.some(j => j.genre === "Réflexion" && j.note >= 80) },
    { nom: "Combat", icon: "🥊", coutRecherche: 80, difficulte: 6, bonusReputation: 2, multiplicateurRevenus: 2.1, pointsNecessaires: 110 , reglagesOptimaux: {"scenarioMissions":7,"graphismesGameplay":3,"facileDifficile":7,"atmosphereMecaniques":7}, conditionText: "Sortir un jeu de Sport (Note >= 75)", condition: (historique) => historique.some(j => j.genre === "Sport" && j.note >= 75) },
    { nom: "Aventure", icon: "🗺️", coutRecherche: 80, difficulte: 5, bonusReputation: 2, multiplicateurRevenus: 1.8, pointsNecessaires: 130 , reglagesOptimaux: {"scenarioMissions":3,"graphismesGameplay":5,"facileDifficile":4,"atmosphereMecaniques":3}, conditionText: "Sortir un jeu de Plateforme (Note >= 80)", condition: (historique) => historique.some(j => j.genre === "Plateforme" && j.note >= 80) },
    { nom: "Infiltration", icon: "🥷", coutRecherche: 120, difficulte: 7, bonusReputation: 3, multiplicateurRevenus: 2.4, pointsNecessaires: 160 , reglagesOptimaux: {"scenarioMissions":4,"graphismesGameplay":6,"facileDifficile":7,"atmosphereMecaniques":4}, conditionText: "Sortir un jeu de Tir (Note >= 85)", condition: (historique) => historique.some(j => j.genre === "Tir" && j.note >= 85) },
    { nom: "RPG", icon: "🛡️", coutRecherche: 85, difficulte: 7, bonusReputation: 3, multiplicateurRevenus: 2.5, pointsNecessaires: 150 , reglagesOptimaux: {"scenarioMissions":2,"graphismesGameplay":6,"facileDifficile":6,"atmosphereMecaniques":3}, conditionText: "Sortir un jeu de Fantasy (Note >= 85)", condition: (historique) => historique.some(j => j.sujet === "Fantasy" && j.note >= 85) },
    { nom: "Simulation", icon: "🏗️", coutRecherche: 130, difficulte: 8, bonusReputation: 4, multiplicateurRevenus: 3, pointsNecessaires: 200 , reglagesOptimaux: {"scenarioMissions":9,"graphismesGameplay":4,"facileDifficile":7,"atmosphereMecaniques":8}, conditionText: "Atteindre le niveau 4 de studio", condition: (historique, gameState) => (gameState.niveauStudio || 1) >= 4 },
    { nom: "Monde Ouvert", icon: "🌍", coutRecherche: 200, difficulte: 10, bonusReputation: 5, multiplicateurRevenus: 4, pointsNecessaires: 300 , reglagesOptimaux: {"scenarioMissions":4,"graphismesGameplay":3,"facileDifficile":5,"atmosphereMecaniques":5}, conditionText: "Atteindre le niveau 5 de studio", condition: (historique, gameState) => (gameState.niveauStudio || 1) >= 5 },
    { nom: "MMORPG", icon: "🌐", coutRecherche: 350, difficulte: 15, bonusReputation: 10, multiplicateurRevenus: 5, pointsNecessaires: 500, reglagesOptimaux: {"scenarioMissions":4,"graphismesGameplay":4,"facileDifficile":6,"atmosphereMecaniques":7}, conditionText: "Studio Niv. 5 et 5 000 000$ générés", condition: (historique, gameState) => (gameState.niveauStudio || 1) >= 5 && (gameState.argentTotalGagne || 0) >= 5000000 }
];

export const SUJETS_CONFIG = [
    { nom: "Fantasy", icon: "🐉", coutRecherche: 5, bonus: { scenario: 10, graphisme: 5 } },
    { nom: "Guerre", icon: "🪖", coutRecherche: 5, bonus: { gameplay: 10, scenario: 5 } },
    { nom: "Animaux", icon: "🐾", coutRecherche: 5, bonus: { longevite: 10, scenario: 5 } },
    { nom: "Science-fiction", icon: "🛸", coutRecherche: 40, bonus: { son: 10, gameplay: 5 }, conditionText: "Sortir un jeu Réflexion (Note >= 60) et Plateforme (Note >= 60)", condition: (historique) => historique.some(j => j.genre === "Réflexion" && j.note >= 60) && historique.some(j => j.genre === "Plateforme" && j.note >= 60) },
    { nom: "Cyberpunk", icon: "🤖", coutRecherche: 35, bonus: { graphisme: 10, son: 5 }, conditionText: "Sortir un jeu de Science-fiction (Note >= 85)", condition: (historique) => historique.some(j => j.sujet === "Science-fiction" && j.note >= 85) },
    { nom: "Espace", icon: "🚀", coutRecherche: 45, bonus: { graphisme: 10, longevite: 5 }, conditionText: "Sortir un jeu de Science-fiction (Note >= 80)", condition: (historique) => historique.some(j => j.sujet === "Science-fiction" && j.note >= 80) },
    { nom: "Horreur", icon: "👻", coutRecherche: 65, bonus: { scenario: 15, longevite: -5 }, conditionText: "Sortir un énorme navet (Note <= 20)", condition: (historique) => historique.some(j => j.note <= 20) },
    { nom: "Médiéval", icon: "🏰", coutRecherche: 70, bonus: { scenario: 10, gameplay: 5 }, conditionText: "Sortir un jeu Clicker (Note >= 80)", condition: (historique) => historique.some(j => j.genre === "Clicker" && j.note >= 80) },
    { nom: "Pirates", icon: "🏴‍☠️", coutRecherche: 75, bonus: { longevite: 10, scenario: 5 }, conditionText: "Sortir un jeu d'Aventure (Note >= 85)", condition: (historique) => historique.some(j => j.genre === "Aventure" && j.note >= 85) },
    { nom: "Détective", icon: "🕵️", coutRecherche: 110, bonus: { scenario: 20, gameplay: -5 }, conditionText: "Sortir un jeu de Réflexion (Note >= 90)", condition: (historique) => historique.some(j => j.genre === "Réflexion" && j.note >= 90) },
    { nom: "Super-héros", icon: "🦸", coutRecherche: 100, bonus: { gameplay: 15, graphisme: 5 }, conditionText: "Studio Niv. 4 et 1 000 000$ générés", condition: (historique, gameState) => (gameState.niveauStudio || 1) >= 4 && (gameState.argentTotalGagne || 0) >= 1000000 },
    { nom: "Sport", icon: "⚽", coutRecherche: 40, bonus: { gameplay: 15, scenario: -5 }, conditionText: "Sortir un jeu de Course (Note >= 75)", condition: (historique) => historique.some(j => j.genre === "Course" && j.note >= 75) }
];

export const PUBLICITE_CONFIG = {
    "Petite campagne": { cout: 500, hype: 10 },
    "Campagne moyenne": { cout: 2000, hype: 30 },
    "Grande campagne": { cout: 10000, hype: 60 },
    "Campagne mondiale": { cout: 50000, hype: 100 }
};

export const EMPLOYES_CONFIG = {
    developpeur: { nom: "Développeur", icon: "💻", cout: 2000, salaire: 2, bonusType: "developpement", bonusValeur: 1, niveauRequis: 1 },
    gameDesigner: { nom: "Game Designer", icon: "🎯", cout: 15000, salaire: 3, bonusType: "gameplay", bonusValeur: 1, niveauRequis: 2 },
    artiste: { nom: "Artiste", icon: "🎨", cout: 50000, salaire: 4, bonusType: "graphismes", bonusValeur: 1, niveauRequis: 3 },
    soundDesigner: { nom: "Sound Designer", icon: "🎵", cout: 50000, salaire: 3, bonusType: "sons", bonusValeur: 1, niveauRequis: 3 },
    scenariste: { nom: "Scénariste", icon: "✍️", cout: 150000, salaire: 3, bonusType: "scenario", bonusValeur: 1, niveauRequis: 4 },
    marketing: { nom: "Marketing", icon: "📈", cout: 500000, salaire: 5, bonusType: "marketing", bonusValeur: 5, niveauRequis: 5 }
};

export const MAX_NIVEAU_PERSONNAGE = 10;
export const STUDIO_LEVELS_CONFIG = {
    1: { nom: "Studio Indé", prix: 0, avantages: "Débloque la taille 'Indé' et les mécaniques de base." },
    2: { nom: "Petit studio Indé", prix: 10000, avantages: "Débloque la taille de jeu 'Petit' et la possibilité de recruter un Game Designer." },
    3: { nom: "Studio AA", prix: 50000, avantages: "Débloque la taille de jeu 'AA' et les campagnes publicitaires moyennes." },
    4: { nom: "Studio AAA", prix: 250000, avantages: "Débloque la taille de jeu 'AAA' et les campagnes publicitaires grandes." },
    5: { nom: "Studio AAAA", prix: 1000000, avantages: "Débloque la taille de jeu 'AAAA' et les campagnes mondiales." }
};

export const PRIX_AMELIORATION_PERSONNAGE = {
    1: 500,
    2: 2000,
    3: 8000,
    4: 20000,
    5: 50000,
    6: 100000,
    7: 250000,
    8: 500000,
    9: 1000000
};
export const PRIX_AMELIORATION_MOTEUR = {
    1: 1000,
    2: 5000,
    3: 20000,
    4: 50000,
    5: 150000,
    6: 500000,
    7: 1500000,
    8: 5000000,
    9: 15000000
};

export function getInitialMoteur() {
    return {
        nom: "Moteur basique",
        niveau: 1,
        caracteristiques: {
            scenario: 1,
            gameplay: 1,
            graphismes: 1,
            sons: 1,
            dureeVie: 1
        }
    };
}

export function getInitialGameState() {
    return {
        argent: CONSTANTS.ARGENT_INITIAL,
        pointsRecherche: 0,
        niveauStudio: 1,
        jeuxCrees: 0,
        jeuActuel: null,
        nomStudio: CONSTANTS.NOM_DU_STUDIO_PAR_DEFAUT,
        nomFondateur: "Fondateur",
        nomMoteur: "Moteur",
        jeuEnDeveloppement: null,
        historique: [],
        jeuxEnVente: [],
        niveauDeveloppeur: 1,
        niveauPersonnage: 1,
        niveauMoteur: 1,
        argentTotalGagne: 0,
        meilleurScore: 0,
        meilleurJeu: null,
        feedbackCurseurs: {},
        reputationStudio: 0,
        moteurJeu: {
            scenario: 1,
            gameplay: 1,
            graphisme: 1,
            son: 1,
            longevite: 1
        },
        moteurStudio: getInitialMoteur(),
        genresDebloques: [
            "Clicker",
            "Réflexion",
            "Plateforme",
            "Visual Novel"
        ],
        sujetsDebloques: [
            "Fantasy",
            "Guerre",
            "Animaux"
        ],
        plateformesDebloquees: ["PC"],
        employes: {
            developpeur: 0,
            gameDesigner: 0,
            artiste: 0,
            soundDesigner: 0,
            scenariste: 0,
            marketing: 0
        },
        salairesEmployesParSeconde: 0,
        language: 'fr'
    };
}

export const GAME_STATE = getInitialGameState();
