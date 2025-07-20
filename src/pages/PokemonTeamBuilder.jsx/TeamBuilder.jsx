import React, { useState, useEffect, useContext } from "react";
import { Bar, Radar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";
import "./Teambuilder.css";
import { PokemonDataContext } from "../../contexts/PokemonDataContext";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { typeColors } from "../../utils/pokemonColors";
import { HelpButton } from "../../components/HelpButton/HelpButton";
import { FaExpandAlt } from "react-icons/fa";
import { FaBook } from "react-icons/fa";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { fetchPokemonSpeciesData } from "../../utils/pokeAPIHelpers";

ChartJS.register(...registerables);

const TeamBuilder = () => {
  const { t, i18n } = useTranslation();
  const pokemonData = useContext(PokemonDataContext);
  const [team, setTeam] = useState([]);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [sprites, setSprites] = useState({});
  const [activeTab, setActiveTab] = useState("coverage");
  const [expandedGraph, setExpandedGraph] = useState(null);
  const [localizedNames, setLocalizedNames] = useState({});

  const saveTeamToLocalStorage = (team) => {
    try {
      localStorage.setItem("pokemonTeam", JSON.stringify(team));
    } catch (error) {
      console.error("Failed to save team to localStorage:", error);
    }
  };

  const loadTeamFromLocalStorage = () => {
    try {
      const savedTeam = localStorage.getItem("pokemonTeam");
      return savedTeam ? JSON.parse(savedTeam) : [];
    } catch (error) {
      console.error("Failed to load team from localStorage:", error);
      return [];
    }
  };

  useEffect(() => {
    const savedTeam = loadTeamFromLocalStorage();
    if (savedTeam.length > 0) {
      setTeam(savedTeam);

      // Preload sprites for saved team
      savedTeam.forEach(async (pokemon) => {
        if (!sprites[pokemon.pokedex_number]) {
          try {
            const response = await fetch(
              `https://pokeapi.co/api/v2/pokemon/${pokemon.name.toLowerCase()}`
            );
            const data = await response.json();
            const sprite =
              data.sprites.other["official-artwork"].front_default ||
              `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.pokedex_number}.png`;

            setSprites((prev) => ({
              ...prev,
              [pokemon.pokedex_number]: sprite,
            }));
          } catch (error) {
            console.error("Failed to fetch Pokémon sprite:", error);
            setSprites((prev) => ({
              ...prev,
              [pokemon.pokedex_number]: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.pokedex_number}.png`,
            }));
          }
        }
      });
    }
  }, []);

  useEffect(() => {
    saveTeamToLocalStorage(team);
  }, [team]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }
  
    const filterResults = async () => {
      // First filter based on English names (immediate response)
      const englishResults = pokemonData.filter((pokemon) => 
        pokemon.name?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5);
  
      // Set initial results with English names
      setSearchResults(englishResults);
  
      // Then fetch and update with localized names
      const translatedResults = await Promise.all(
        englishResults.map(async (pokemon) => {
          try {
            const speciesData = await fetchPokemonSpeciesData(pokemon.pokedex_number);
            const localizedName = speciesData.names.find(
              name => name.language.name === i18n.language
            )?.name || pokemon.name;
            
            // Update localized names cache
            setLocalizedNames(prev => ({
              ...prev,
              [pokemon.pokedex_number]: {
                name: localizedName,
                language: i18n.language
              }
            }));
  
            return pokemon; // Return original pokemon - the name will update via state
          } catch (error) {
            console.error(`Error updating name for Pokemon ${pokemon.pokedex_number}:`, error);
            return pokemon;
          }
        })
      );
  
      // Update results with translations (though names will update via localizedNames state)
      setSearchResults(translatedResults);
    };
  
    filterResults();
  }, [searchQuery, pokemonData, i18n.language]);

  useEffect(() => {
    const updateLocalizedNames = async () => {
      const newLocalizedNames = { ...localizedNames };
      
      await Promise.all(
        team.map(async (pokemon) => {
          try {
            const speciesData = await fetchPokemonSpeciesData(pokemon.pokedex_number);
            const localizedName = speciesData.names.find(
              name => name.language.name === i18n.language
            )?.name || pokemon.name;
            
            newLocalizedNames[pokemon.pokedex_number] = {
              name: localizedName,
              language: i18n.language
            };
          } catch (error) {
            console.error(`Error updating name for Pokemon ${pokemon.pokedex_number}:`, error);
            newLocalizedNames[pokemon.pokedex_number] = {
              name: pokemon.name,
              language: i18n.language
            };
          }
        })
      );
  
      setLocalizedNames(newLocalizedNames);
    };
  
    if (team.length > 0) {
      updateLocalizedNames();
    }
  }, [i18n.language]);

  function getStatColor(stat) {
    const colors = {
      hp: "#FF5959",
      attack: "#F5AC78",
      defense: "#FAE078",
      sp_attack: "#9DB7F5",
      sp_defense: "#A7DB8D",
      speed: "#FA92B2",
    };
    return colors[stat];
  }

  const addToTeam = async (pokemon) => {
    if (
      team.length >= 6 ||
      team.some((p) => p.pokedex_number === pokemon.pokedex_number)
    )
      return;

    try {
      // Check if sprite is already cached

      if (!sprites[pokemon.pokedex_number]) {
        const response = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${pokemon.name.toLowerCase()}`
        );
        const data = await response.json();
        const sprite =
          data.sprites.other["official-artwork"].front_default ||
          `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.pokedex_number}.png`;

        setSprites((prev) => ({
          ...prev,
          [pokemon.pokedex_number]: sprite,
        }));
      }

      if (
        !localizedNames[pokemon.pokedex_number] ||
        localizedNames[pokemon.pokedex_number].language !== i18n.language
      ) {
        const speciesData = await fetchPokemonSpeciesData(
          pokemon.pokedex_number
        );
        const localizedName =
          speciesData.names.find((name) => name.language.name === i18n.language)
            ?.name || pokemon.name;

        setLocalizedNames((prev) => ({
          ...prev,
          [pokemon.pokedex_number]: {
            name: localizedName,
            language: i18n.language,
          },
        }));
      }

      setTeam((prev) => [...prev, pokemon]);
      setSearchQuery("");
      setSearchResults([]);
    } catch (error) {
      console.error("Failed to fetch Pokémon sprite:", error);
      setSprites((prev) => ({
        ...prev,
        [pokemon.pokedex_number]: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.pokedex_number}.png`,
      }));
      setLocalizedNames((prev) => ({
        ...prev,
        [pokemon.pokedex_number]: {
          name: pokemon.name,
          language: i18n.language,
        },
      }));
      setTeam((prev) => [...prev, pokemon]);
    }
  };

  const removeFromTeam = (pokedexNumber) => {
    setTeam(team.filter((p) => p.pokedex_number !== pokedexNumber));
  };

  // Graph 1: Type Coverage Radar Chart
  const typeCoverageData = {
    labels: [
      t("types.normal"),
      t("types.fire"),
      t("types.water"),
      t("types.electric"),
      t("types.grass"),
      t("types.ice"),
      t("types.fight"),
      t("types.poison"),
      t("types.ground"),
      t("types.flying"),
      t("types.psychic"),
      t("types.bug"),
      t("types.rock"),
      t("types.ghost"),
      t("types.dragon"),
      t("types.dark"),
      t("types.steel"),
      t("types.fairy"),
    ],
    datasets: [
      {
        label: t("team_builder.type_coverage"),
        data: calculateTypeCoverage(),
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderColor: "rgba(54, 162, 235, 1)",
        pointBackgroundColor: "rgba(54, 162, 235, 0.5)",
        pointBorderColor: "#fff",
      },
    ],
  };

  // Graph 2: Stat Distribution Bar Chart
  const statDistributionData = {
    labels: team.map((p) => p.name),
    datasets: [
      t("stats.hp"),
      t("stats.attack"),
      t("stats.defense"),
      t("stats.sp_attack"),
      t("stats.sp_defense"),
      t("stats.speed"),
    ].map((stat, index) => {
      const statKeys = [
        "hp",
        "attack",
        "defense",
        "sp_attack",
        "sp_defense",
        "speed",
      ];
      return {
        label: stat,
        data: team.map((p) => p[statKeys[index]]),
        backgroundColor: getStatColor(statKeys[index]),
      };
    }),
  };

  // Graph 3: Type Balance Pie Chart
  const typeBalanceData = {
    labels: [
      ...new Set(team.flatMap((p) => [p.type1, p.type2].filter(Boolean))),
    ].map((type) => t(`types.${type.toLowerCase()}`)),
    datasets: [
      {
        data: [
          ...new Set(team.flatMap((p) => [p.type1, p.type2].filter(Boolean))),
        ].map((type) => {
          return team.reduce((count, pokemon) => {
            if (pokemon.type1 === type || pokemon.type2 === type) {
              return count + 1;
            }
            return count;
          }, 0);
        }),
        // Map each type to its corresponding color
        backgroundColor: [
          ...new Set(team.flatMap((p) => [p.type1, p.type2].filter(Boolean))),
        ].map((type) => typeColors[type.toLowerCase()]),
      },
    ],
  };

  const teamWeaknessData = {
    labels: [
      t("types.normal"),
      t("types.fire"),
      t("types.water"),
      t("types.electric"),
      t("types.grass"),
      t("types.ice"),
      t("types.fight"),
      t("types.poison"),
      t("types.ground"),
      t("types.flying"),
      t("types.psychic"),
      t("types.bug"),
      t("types.rock"),
      t("types.ghost"),
      t("types.dragon"),
      t("types.dark"),
      t("types.steel"),
      t("types.fairy"),
    ],
    datasets: [
      {
        label: t("team_builder.team_weakness_score"),
        data: calculateTeamWeaknesses(),
        backgroundColor: (ctx) => {
          const value = ctx.raw;
          return value > 2
            ? "rgba(255, 99, 132, 1)"
            : value > 1
            ? "rgba(255, 159, 64, 0.8)"
            : "rgb(75, 192, 128, 0.5)";
        },
        borderColor: "#fff",
        borderWidth: "1",
      },
    ],
  };

  function calculateTeamWeaknesses() {
    return typeCoverageData.labels.map((type) => {
      const typeKey = `against_${type.toLowerCase()}`;
      return (
        team.reduce((sum, pokemon) => {
          return sum + (parseFloat(pokemon[typeKey]) || 1);
        }, 0) / team.length
      );
    });
  }

  function calculateTypeCoverage() {
    const typeEffectiveness = {
      fire: ["grass", "ice", "bug", "steel"],
      water: ["fire", "ground", "rock"],
      electric: ["water", "flying"],
      grass: ["water", "ground", "rock"],
      ice: ["grass", "ground", "flying", "dragon"],
      fighting: ["normal", "ice", "rock", "dark", "steel"],
      poison: ["grass", "fairy"],
      ground: ["fire", "electric", "poison", "rock", "steel"],
      flying: ["grass", "fighting", "bug"],
      psychic: ["fighting", "poison"],
      bug: ["grass", "psychic", "dark"],
      rock: ["fire", "ice", "flying", "bug"],
      ghost: ["psychic", "ghost"],
      dragon: ["dragon"],
      dark: ["psychic", "ghost"],
      steel: ["ice", "rock", "fairy"],
      fairy: ["fighting", "dragon", "dark"],
    };

    const allTypes = [
      "normal",
      "fire",
      "water",
      "electric",
      "grass",
      "ice",
      "fighting",
      "poison",
      "ground",
      "flying",
      "psychic",
      "bug",
      "rock",
      "ghost",
      "dragon",
      "dark",
      "steel",
      "fairy",
    ];

    return allTypes.map((type) => {
      let count = 0;
      team.forEach((pokemon) => {
        const pokemonTypes = [pokemon.type1, pokemon.type2].filter(Boolean);
        pokemonTypes.forEach((pType) => {
          if (typeEffectiveness[pType]?.includes(type)) {
            count++;
          }
        });
      });
      return count;
    });
  }

  const GraphModal = () => {
    if (!expandedGraph) return null;

    const getModalContent = () => {
      switch (expandedGraph) {
        case "coverage":
          return (
            <Radar
              data={typeCoverageData}
              options={getRadarOptions()}
              height="400px"
              width="600px"
            />
          );
        case "weakness":
          return (
            <Radar
              data={teamWeaknessData}
              options={getRadarOptions()}
              height="400px"
              width="600px"
            />
          );
        case "typeBalance":
          return (
            <Pie
              data={typeBalanceData}
              options={getPieOptions()}
              height="400px"
              width="400px"
            />
          );
        case "statDistribution":
          return (
            <Bar
              data={statDistributionData}
              options={getBarOptions()}
              height="400px"
              width="600px"
            />
          );
        default:
          return null;
      }
    };

    return (
      <div className="graph-modal-overlay">
        <div className="graph-modal">
          <button
            className="close-modal"
            onClick={() => setExpandedGraph(null)}
          >
            ×
          </button>
          {getModalContent()}
        </div>
      </div>
    );
  };

  // Helper functions for chart options
  const getRadarOptions = (title) => ({
    scales: {
      r: {
        pointLabels: {
          color: "white",
        },
        angleLines: { color: "rgba(255, 255, 255, 0.2)" },
        grid: { color: "rgba(255, 255, 255, 0.2)" },
        suggestedMin: 0,
        suggestedMax: 2,
        ticks: {
          callback: (value) => `${value}x`,
          stepSize: 0.5,
          backdropColor: "transparent",
          font: { size: 12 },
          color: "white",
        },
      },
    },
    elements: {
      point: {
        radius: 4,
        hoverRadius: 5,
        borderWidth: 2,
        hoverBorderWidth: 0,
      },
      line: {
        tension: 0.1,
        borderWidth: 3,
      },
    },
    plugins: {
      legend: {
        title: {
          display: true,
          color: "white",
          font: { size: 16, weight: "bold" },
        },
        labels: {
          font: {
            size: 14,
          },
          color: "white",
        },
      },
    },
  });

  const getPieOptions = () => ({
    plugins: {
      title: {
        display: true,
        text: "Team Type Composition",
        font: { size: 20 },
        padding: { top: 10, bottom: 30 },
      },
    },
    maintainAspectRatio: false,
  });

  const getBarOptions = () => ({
    plugins: {
      title: {
        display: true,
        text: "Team Stat Distribution",
        color: "white",
        font: { size: 16, weight: "bold" },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${ctx.raw}`,
        },
      },
      legend: {
        labels: {
          color: "white",
          font: { size: 12 },
          padding: 16,
          usePointStyle: true,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "white" },
      },
      y: {
        grid: {
          color: "white",
          drawTicks: false,
        },
        ticks: {
          color: "white",
          callback: (val) => (val % 10 === 0 ? val : ""),
        },
      },
    },
    datasets: {
      bar: {
        categoryPercentage: 0.8,
        barPercentage: 0.9,
      },
    },
    elements: {
      bar: {
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.3)",
        borderRadius: 4,
      },
    },
  });

  const generateRandomTeam = () => {
    if (team.length > 0) return; // Don't generate if team isn't empty

    // Create a copy of pokemonData array
    const pokemonDataCopy = [...pokemonData];
    const randomTeam = [];

    // Get 6 unique random pokemon
    for (let i = 0; i < 6 && pokemonDataCopy.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * pokemonDataCopy.length);
      const randomPokemon = pokemonDataCopy.splice(randomIndex, 1)[0];
      randomTeam.push(randomPokemon);
    }

    setTeam(randomTeam);

    // Preload sprites for the random team
    randomTeam.forEach(async (pokemon) => {
      if (!sprites[pokemon.pokedex_number]) {
        try {
          const response = await fetch(
            `https://pokeapi.co/api/v2/pokemon/${pokemon.name.toLowerCase()}`
          );
          const data = await response.json();
          const sprite =
            data.sprites.other["official-artwork"].front_default ||
            `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.pokedex_number}.png`;
          
            const speciesData = await fetchPokemonSpeciesData(
              pokemon.pokedex_number
            );
            const localizedName =
              speciesData.names.find((name) => name.language.name === i18n.language)
                ?.name || pokemon.name;
    
            setLocalizedNames((prev) => ({
              ...prev,
              [pokemon.pokedex_number]: {
                name: localizedName,
                language: i18n.language,
              },
            }));
            
          setSprites((prev) => ({
            ...prev,
            [pokemon.pokedex_number]: sprite,
          }));
        } catch (error) {
          console.error("Failed to fetch Pokémon sprite:", error);
          setSprites((prev) => ({
            ...prev,
            [pokemon.pokedex_number]: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.pokedex_number}.png`,
          }));
        }
      }
    });
  };

  const clearTeam = () => {
    setTeam([]);
  };

  return (
    <div className="team-builder">
      <div className="team-selection">
        <h2>{t("team_builder.create_team", { count: team.length })}</h2>
        <div className="pokemon-search">
          <input
            type="text"
            placeholder={t("team_builder.search_placeholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map((pokemon) => (
                <div
                  key={pokemon.pokedex_number}
                  className="search-result-item"
                  onClick={() => addToTeam(pokemon)}
                >
                  <span>
                    #{pokemon.pokedex_number}{" "}
                    {localizedNames[pokemon.pokedex_number]?.name ||
                      pokemon.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="team-slots">
          {team.length === 0 ? (
            <div className="empty-team-prompt">
              <p>{t("team_builder.empty_team")}</p>
              <img
                src="/empty_pokeball.png"
                alt={t("team_builder.empty_team_alt")}
              />
              <small>{t("team_builder.empty_team_hint")}</small>
              <button
                className="random-team-button"
                onClick={generateRandomTeam}
              >
                {t("team_builder.generate_random_team")}
              </button>
            </div>
          ) : (
            Array(6)
              .fill()
              .map((_, i) => (
                <div key={i} className="team-slot">
                  {team[i] ? (
                    <div
                      className={`team-pokemon-card ${
                        selectedPokemon?.pokedex_number ===
                        team[i].pokedex_number
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => setSelectedPokemon(team[i])}
                    >
                      <img
                        src={sprites[team[i].pokedex_number]}
                        alt={localizedNames[team[i].pokedex_number]?.name || team[i].name}
                      />
                      <div className="pokemon-info">
                        <span>
                        #{team[i].pokedex_number} {localizedNames[team[i].pokedex_number]?.name || team[i].name}
                        </span>
                      </div>
                      <div className="team-actions">
                        <div className="team-tooltip-container">
                          <Link
                            className="global-link"
                            to={`/pokemon/${team[i]?.pokedex_number}`}
                            state={{ from: "/team-builder" }}
                          >
                            <FaBook />
                          </Link>
                          <span className="team-tooltip">
                            {t("team_builder.view_details")}
                          </span>
                        </div>

                        <div className="team-tooltip-container">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromTeam(team[i].pokedex_number);
                            }}
                          >
                            <IoMdCloseCircleOutline className="remove-icon" />
                          </button>
                          <span className="team-tooltip">
                            {t("team_builder.remove")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="empty-slot">
                      {t("team_builder.slot", { number: i + 1 })}
                    </div>
                  )}
                </div>
              ))
          )}
          {team.length > 0 && (
            <button className="clear-team-button" onClick={clearTeam}>
              {t("team_builder.clear_team")}
            </button>
          )}
        </div>
      </div>
      {team.length > 0 ? (
        <div className="team-analysis radar-graph">
          <div className="analysis-graph">
            <div className="radar-tabs">
              <button
                className={
                  activeTab === "coverage"
                    ? "active radar-button"
                    : " radar-button"
                }
                onClick={() => setActiveTab("coverage")}
              >
                {t("team_builder.type_coverage")}
              </button>
              <button
                className={
                  activeTab === "weakness"
                    ? "active radar-button"
                    : " radar-button"
                }
                onClick={() => setActiveTab("weakness")}
              >
                {t("team_builder.team_weaknesses")}
              </button>
              <div className="team-tooltip-container">
                <HelpButton
                  content={
                    activeTab === "coverage" ? (
                      <div>
                        <p>{t("team_builder.coverage_help")}</p>
                        <strong>{t("team_builder.good_indicators")}:</strong>
                        <ul>
                          <li>{t("team_builder.coverage_indicator1")}</li>
                          <li>{t("team_builder.coverage_indicator2")}</li>
                          <li>{t("team_builder.coverage_indicator3")}</li>
                        </ul>
                      </div>
                    ) : (
                      <div>
                        <p>{t("team_builder.weakness_help")}</p>
                        <strong>{t("team_builder.good_indicators")}:</strong>
                        <ul>
                          <li>{t("team_builder.weakness_indicator1")}</li>
                          <li>{t("team_builder.weakness_indicator2")}</li>
                          <li>{t("team_builder.weakness_indicator3")}</li>
                        </ul>
                      </div>
                    )
                  }
                />
                <span className="team-tooltip">
                  {t("team_builder.graph_info")}
                </span>
              </div>
              <div className="team-tooltip-container">
                <button
                  className="expand-button"
                  onClick={() =>
                    setExpandedGraph(
                      activeTab === "coverage" ? "coverage" : "weakness"
                    )
                  }
                >
                  <span>
                    <FaExpandAlt />
                  </span>
                </button>
                <span className="team-tooltip">
                  {t("team_builder.zoom_in")}
                </span>
              </div>
            </div>

            <div className="radar-container">
              {activeTab === "coverage" ? (
                <Radar
                  data={typeCoverageData}
                  options={{
                    scales: {
                      r: {
                        pointLabels: {
                          color: "white",
                        },
                        angleLines: { color: "rgba(255, 255, 255, 0.2)" },
                        grid: { color: "rgba(255, 255, 255, 0.2)" },
                        suggestedMin: 0,
                        suggestedMax: 2,
                        ticks: {
                          callback: (value) => `${value}x`,
                          stepSize: 0.5,
                          backdropColor: "transparent",
                          font: { size: 12 },
                          color: "white",
                        },
                      },
                    },
                    elements: {
                      point: {
                        radius: 4,
                        hoverRadius: 5,
                        borderWidth: 2,
                        hoverBorderWidth: 0,
                      },
                      line: {
                        tension: 0.1,
                        borderWidth: 3,
                      },
                    },
                    plugins: {
                      legend: {
                        title: {
                          display: true,
                          color: "white",
                          font: { size: 16, weight: "bold" },
                        },
                        labels: {
                          font: {
                            size: 14,
                          },
                          color: "white",
                        },
                      },
                    },
                  }}
                />
              ) : (
                <Radar
                  data={teamWeaknessData}
                  options={{
                    scales: {
                      r: {
                        pointLabels: {
                          color: "white",
                        },
                        angleLines: { color: "rgba(255, 255, 255, 0.2)" },
                        grid: { color: "rgba(255, 255, 255, 0.2)" },
                        suggestedMin: 0,
                        suggestedMax: 2.5,
                        ticks: {
                          callback: (value) => `${value}x`,
                          stepSize: 0.5,
                          backdropColor: "transparent",
                          font: { size: 12 },
                          color: "white",
                        },
                      },
                    },
                    elements: {
                      point: {
                        radius: 4,
                        hoverRadius: 5,
                        borderWidth: 2,
                        hoverBorderWidth: 0,
                      },
                      line: {
                        tension: 0.1,
                        borderWidth: 3,
                      },
                    },
                    plugins: {
                      legend: {
                        title: {
                          display: true,
                          color: "white",
                          font: { size: 16, weight: "bold" },
                        },
                        labels: {
                          font: {
                            size: 14,
                          },
                          color: "white",
                        },
                      },
                    },
                  }}
                />
              )}
            </div>

            <div className="radar-legend">
              {activeTab === "weakness" && (
                <div className="weakness-">
                  <span style={{ color: "#ff6384" }}>
                    {t("team_builder.high_vulnerability")}
                  </span>
                  <span style={{ color: "#ff9f40" }}>
                    {t("team_builder.moderate_weakness")}
                  </span>
                  <span style={{ color: "#4bc0c0" }}>
                    {t("team_builder.resistant")}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="analysis-graph type-balance">
            <div className="graph-header">
              <h3>{t("team_builder.type_balance")}</h3>
              <div className="team-tooltip-container">
                <HelpButton
                  content={
                    <div>
                      <p>{t("team_builder.type_balance_help")}</p>
                      <strong>{t("team_builder.good_indicators")}:</strong>
                      <ul>
                        <li>{t("team_builder.balance_indicator1")}</li>
                        <li>{t("team_builder.balance_indicator2")}</li>
                        <li>{t("team_builder.balance_indicator3")}</li>
                      </ul>
                      <p>{t("team_builder.type_balance_tip")}</p>
                    </div>
                  }
                />
                <span className="team-tooltip">
                  {t("team_builder.graph_info")}
                </span>
              </div>
              <div className="team-tooltip-container">
                <button
                  className="expand-button"
                  onClick={() => setExpandedGraph("typeBalance")}
                >
                  <FaExpandAlt />
                </button>
                <span className="team-tooltip">
                  {t("team_builder.zoom_in")}
                </span>
              </div>
            </div>
            <Pie
              data={typeBalanceData}
              options={{
                plugins: {
                  title: {
                    display: true,
                    color: "white",
                    font: { size: 16, weight: "bold" },
                  },
                  tooltip: {
                    callbacks: {
                      label: (ctx) => `${ctx.label}: ${ctx.raw} Pokémon`,
                    },
                  },
                  legend: {
                    labels: {
                      color: "white",
                      font: { size: 12 },
                      padding: 16,
                      usePointStyle: true,
                    },
                  },
                },
                borderColor: "transparent",
              }}
            />
          </div>
          <div className="analysis-graph stat-distribution">
            <div className="graph-header">
              <h3>{t("team_builder.stat_distribution")}</h3>
              <div className="team-tooltip-container">
                <HelpButton
                  content={
                    <div>
                      <p>{t("team_builder.stat_distribution_help")}</p>
                      <strong>{t("team_builder.good_indicators")}:</strong>
                      <ul>
                        <li>{t("team_builder.stat_indicator1")}</li>
                        <li>{t("team_builder.stat_indicator2")}</li>
                        <li>{t("team_builder.stat_indicator3")}</li>
                      </ul>
                      <p>{t("team_builder.stat_distribution_tip")}</p>
                    </div>
                  }
                />
                <span className="team-tooltip">
                  {t("team_builder.graph_info")}
                </span>
              </div>
              <div className="team-tooltip-container">
                <button
                  className="expand-button"
                  onClick={() => setExpandedGraph("statDistribution")}
                >
                  <FaExpandAlt />
                </button>
                <span className="team-tooltip">
                  {t("team_builder.zoom_in")}
                </span>
              </div>
            </div>
            <Bar
              data={statDistributionData}
              options={{
                plugins: {
                  title: {
                    display: true,
                    color: "white",
                    font: { size: 16, weight: "bold" },
                  },
                  tooltip: {
                    callbacks: {
                      label: (ctx) => `${ctx.dataset.label}: ${ctx.raw}`,
                    },
                  },
                  legend: {
                    labels: {
                      color: "white",
                      font: { size: 12 },
                      padding: 16,
                      usePointStyle: true,
                    },
                  },
                },
                scales: {
                  x: {
                    grid: { display: false },
                    ticks: { color: "white" },
                  },
                  y: {
                    grid: {
                      color: "white",
                      drawTicks: false,
                    },
                    ticks: {
                      color: "white",
                      callback: (val) => (val % 10 === 0 ? val : ""),
                    },
                  },
                },
                datasets: {
                  bar: {
                    categoryPercentage: 0.8,
                    barPercentage: 0.9,
                  },
                },
                elements: {
                  bar: {
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.3)",
                    borderRadius: 4,
                  },
                },
              }}
            />
          </div>
        </div>
      ) : (
        <div className="empty-analysis">
          <h3>{t("team_builder.add_pokemon_title")}</h3>
          <p>{t("team_builder.add_pokemon_message")}</p>
        </div>
      )}
      <GraphModal />
    </div>
  );
};

export default TeamBuilder;
