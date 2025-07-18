// utils/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        sidebar: {
          title: "PokéAnalytics",
          team_builder: "Team Builder",
          pokedex: "Pokédex",
          expand: "Expand sidebar",
          collapse: "Collapse sidebar",
        },
        base_stats: "Base Stats",
        physical_traits: "Physical Traits",
        height: "Height",
        weight: "Weight",
        male_ratio: "Male Ratio",
        genderless: "Genderless",
        battle_stats: "Battle Stats",
        capture_rate: "Capture Rate",
        base_happiness: "Base Happiness",
        legendary: "Legendary",
        yes: "Yes",
        no: "No",
        abilities: "Abilities",
        weaknesses: "Weaknesses",
        resistances: "Resistances",
        immunities: "Immunities",
        stats: {
          hp: "HP",
          attack: "Attack",
          defense: "Defense",
          sp_attack: "Sp. Attack",
          sp_defense: "Sp. Defense",
          speed: "Speed",
        },
        pokedex: {
          title: "Pokémon Directory",
          welcome_message:
            "Welcome to the Pokédex! Click on a Pokémon to learn more about them or search one by their name.",
          search_placeholder: "Search all Pokémon...",
          no_results: 'No Pokémon found matching "{searchTerm}"',
        },
        pagination: {
          previous: "Previous",
          next: "Next",
          page_info: "Page {{current}} of {{total}} ({{count}} results)",
        },
        loading: "Loading",
        loading_sprites: "Loading sprites...",
        team_builder: {
          team_weakness_score: "Team Weakness Score",
          clear_team: "Clear Team",
          generate_random_team: "Generate Random Team",
          create_team: "Create Your Team ({{count}}/6)",
          search_placeholder: "Search Pokémon by name",
          empty_team: "Your team is empty",
          empty_team_alt: "Empty Pokéball",
          empty_team_hint:
            "Search and add Pokémon to get started. If you are not familiar with Pokémon, you can generate a random team.",
          view_details: "View Pokémon details",
          remove: "Remove from team",
          slot: "Slot {{number}}",
          type_coverage: "Type Coverage",
          team_weaknesses: "Team Weaknesses",
          graph_info: "Graph Info",
          zoom_in: "Zoom in",
          offensive_coverage: "Offensive Type Coverage",
          defensive_vulnerability: "Defensive Vulnerability",
          high_vulnerability: "High Vulnerability (>2x)",
          moderate_weakness: "Moderate Weakness (1-2x)",
          resistant: "Resistant (<1x)",
          type_balance: "Type Balance",
          stat_distribution: "Stat Distribution",
          add_pokemon_title: "Add Pokémon to your team to see analysis",
          add_pokemon_message:
            "Select at least one Pokémon to view type coverage, weaknesses, and stat distributions",

          coverage_help:
            "This shows how many super-effective moves your team has against each type.",
          weakness_help:
            "Shows your team's average vulnerability to each type (higher = worse).",
          good_indicators: "Good team indicators",
          coverage_indicator1: "Coverage across many types (wider shape)",
          coverage_indicator2: "No major gaps (no types with 0 coverage)",
          coverage_indicator3: "Multiple strong coverages (peaks above 2)",
          weakness_indicator1: "Few spikes above 2x (red areas)",
          weakness_indicator2: "Balanced resistances (blue/green areas)",
          weakness_indicator3: "No single type with extreme weakness",

          type_balance_help: "Shows the distribution of types in your team.",
          balance_indicator1: "Diverse type representation",
          balance_indicator2: "No over-reliance on one type",
          balance_indicator3: "Complementary type pairings",
          type_balance_tip: "Tip: Aim for 6-10 unique types across your team.",

          stat_distribution_help:
            "Compares base stats across your team members.",
          stat_indicator1: "Balanced stats overall",
          stat_indicator2:
            "Specialized roles (some high Attack, others high Defense)",
          stat_indicator3: "No extreme weaknesses in any stat",
          stat_distribution_tip:
            "Tip: Aim for at least 2 Pokémon with high HP/Defenses.",
        },
        types: {
          normal: "Normal",
          fire: "Fire",
          water: "Water",
          electric: "Electric",
          grass: "Grass",
          ice: "Ice",
          fight: "Fighting",
          poison: "Poison",
          ground: "Ground",
          flying: "Flying",
          psychic: "Psychic",
          bug: "Bug",
          rock: "Rock",
          ghost: "Ghost",
          dragon: "Dragon",
          dark: "Dark",
          steel: "Steel",
          fairy: "Fairy",
        },
        breadcrumbs: {
          team_builder: "Team Builder",
          pokedex: "Pokédex",
          back_to: "Back to",
        },
      },
    },
    fr: {
      translation: {
        sidebar: {
          title: "PokéAnalytique",
          team_builder: "Constructeur d'équipe",
          pokedex: "Pokédex",
          expand: "Développer le menu",
          collapse: "Réduire le menu",
        },
        base_stats: "Stats de Base",
        physical_traits: "Caractéristiques Physiques",
        height: "Taille",
        weight: "Poids",
        male_ratio: "Ratio Mâle",
        genderless: "Sans Genre",
        battle_stats: "Stats de Combat",
        capture_rate: "Taux de Capture",
        base_happiness: "Bonheur de Base",
        legendary: "Légendaire",
        yes: "Oui",
        no: "Non",
        abilities: "Capacités",
        weaknesses: "Faiblesses",
        resistances: "Résistances",
        immunities: "Immunités",
        stats: {
          hp: "PV",
          attack: "Attaque",
          defense: "Défense",
          sp_attack: "Attaque Spé.",
          sp_defense: "Défense Spé.",
          speed: "Vitesse",
        },
        pokedex: {
          title: "Répertoire Pokémon",
          welcome_message:
            "Bienvenue dans le Pokédex ! Cliquez sur un Pokémon pour en savoir plus ou recherchez-en un par son nom.",
          search_placeholder: "Rechercher tous les Pokémon...",
          no_results: 'Aucun Pokémon trouvé correspondant à "{searchTerm}"',
        },
        pagination: {
          previous: "Précédent",
          next: "Suivant",
          page_info: "Page {{current}} sur {{total}} ({{count}} résultats)",
        },
        loading: "Chargement",
        loading_sprites: "Chargement des sprites...",
        team_builder: {
          team_weakness_score: "Score de Faiblesse de l'Équipe",
          clear_team: "Vider l'équipe",
          generate_random_team: "Générer une équipe aléatoire",
          create_team: "Créez votre équipe ({{count}}/6)",
          search_placeholder: "Rechercher un Pokémon par nom",
          empty_team: "Votre équipe est vide",
          empty_team_alt: "Pokéball vide",
          empty_team_hint:
            "Recherchez et ajoutez des Pokémon pour commencer. Si vous ne connaissez pas les Pokémon, vous pouvez générer une équipe aléatoire.",
          view_details: "Voir les détails du Pokémon",
          remove: "Retirer de l'équipe",
          slot: "Emplacement {{number}}",
          type_coverage: "Couverture de types",
          team_weaknesses: "Faiblesses de l'équipe",
          graph_info: "Infos graphique",
          zoom_in: "Zoomer",
          offensive_coverage: "Couverture offensive des types",
          defensive_vulnerability: "Vulnérabilité défensive",
          high_vulnerability: "Haute vulnérabilité (>2x)",
          moderate_weakness: "Faiblesse modérée (1-2x)",
          resistant: "Résistant (<1x)",
          type_balance: "Équilibre des types",
          stat_distribution: "Répartition des stats",
          add_pokemon_title: "Ajoutez des Pokémon pour voir l'analyse",
          add_pokemon_message:
            "Sélectionnez au moins un Pokémon pour voir la couverture de types, les faiblesses et les statistiques",

          coverage_help:
            "Montre combien de coups super efficaces votre équipe a contre chaque type.",
          weakness_help:
            "Montre la vulnérabilité moyenne de votre équipe à chaque type (plus élevé = pire).",
          good_indicators: "Indicateurs d'une bonne équipe",
          coverage_indicator1: "Couverture sur de nombreux types (forme large)",
          coverage_indicator2:
            "Pas de lacunes majeures (aucun type avec 0 couverture)",
          coverage_indicator3:
            "Plusieurs couvertures fortes (pics au-dessus de 2)",
          weakness_indicator1: "Peu de pics au-dessus de 2x (zones rouges)",
          weakness_indicator2: "Résistances équilibrées (zones bleues/vertes)",
          weakness_indicator3: "Aucun type avec une faiblesse extrême",

          type_balance_help:
            "Montre la répartition des types dans votre équipe.",
          balance_indicator1: "Diversité des types représentés",
          balance_indicator2: "Pas de dépendance excessive à un type",
          balance_indicator3: "Combinaisons de types complémentaires",
          type_balance_tip:
            "Conseil : Visez 6-10 types uniques dans votre équipe.",

          stat_distribution_help:
            "Compare les statistiques de base des membres de votre équipe.",
          stat_indicator1: "Stats globalement équilibrées",
          stat_indicator2:
            "Rôles spécialisés (certains avec Attaque élevée, d'autres avec Défense élevée)",
          stat_indicator3: "Pas de faiblesses extrêmes dans aucune stat",
          stat_distribution_tip:
            "Conseil : Visez au moins 2 Pokémon avec PV/Défenses élevés.",
        },
        types: {
          normal: "Normal",
          fire: "Feu",
          water: "Eau",
          electric: "Électrik",
          grass: "Plante",
          ice: "Glace",
          fight: "Combat",
          poison: "Poison",
          ground: "Sol",
          flying: "Vol",
          psychic: "Psy",
          bug: "Insecte",
          rock: "Roche",
          ghost: "Spectre",
          dragon: "Dragon",
          dark: "Ténèbres",
          steel: "Acier",
          fairy: "Fée",
        },
        breadcrumbs: {
          team_builder: "Constructeur d'Équipe",
          pokedex: "Pokédex",
          back_to: "Retour à",
        },
      },
    },
  },
  lng: "en", // default language
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
