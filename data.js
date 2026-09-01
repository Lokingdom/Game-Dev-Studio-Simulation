export const CONSTANTS = {
    TICKS_PAR_SECONDE: 10,
    ARGENT_INITIAL: 1000,
    COUT_BASE_JEU: 50,
    COUT_MOTEUR_BASE: 100,
    NOM_DU_STUDIO_PAR_DEFAUT: "Mon Super Studio",
    SAVE_KEY: 'gameDevStudioSave',
    MAX_HISTORIQUE: 100
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
    { nom: "PC", icon: "💻", coutRecherche: 0, multiplicateurRevenus: 1, difficulte: 1 }
];

export const GENRES_CONFIG = [
    { nom: "Clicker", icon: "🖱️", coutRecherche: 10, difficulte: 1, bonusReputation: 0, multiplicateurRevenus: 1, pointsNecessaires: 20, reglagesOptimaux: {} }
];

export const SUJETS_CONFIG = [
    { nom: "Fantasy", icon: "🐉", coutRecherche: 5, bonus: { scenario: 10, graphisme: 5 } }
];

export const PUBLICITE_CONFIG = {};
export const EMPLOYES_CONFIG = {};

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