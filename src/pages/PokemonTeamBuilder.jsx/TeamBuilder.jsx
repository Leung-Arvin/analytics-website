import React, { useState, useEffect, useContext } from "react";
import { Bar, Radar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";
import "./Teambuilder.css";
import { PokemonDataContext } from "../../contexts/PokemonDataContext";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { typeColors } from "../../utils/pokemonColors";
import { HelpButton } from "../../components/HelpButton/HelpButton";
import { FaExpandAlt } from "react-icons/fa";

ChartJS.register(...registerables);

const TeamBuilder = () => {
  const pokemonData = useContext(PokemonDataContext);
  const [team, setTeam] = useState([]);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [sprites, setSprites] = useState({});
  const [activeTab, setActiveTab] = useState("coverage");
  const [expandedGraph, setExpandedGraph] = useState(null);

  useEffect(() => {
    if (searchQuery.trim() == "") {
      setSearchResults([]);
      return;
    }

    const results = pokemonData.filter((pokemon) =>
      pokemon.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setSearchResults(results.slice(0, 5));
  }, [searchQuery, pokemonData]);

  function getStatColor(stat) {
    const colors = {
      HP: "#FF5959",
      Attack: "#F5AC78",
      Defense: "#FAE078",
      sp_attack: "#9DB7F5",
      sp_defense: "#A7DB8D",
      Speed: "#FA92B2",
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

      setTeam((prev) => [...prev, pokemon]);
      setSearchQuery("");
      setSearchResults([]);
    } catch (error) {
      console.error("Failed to fetch Pokémon sprite:", error);
      setSprites((prev) => ({
        ...prev,
        [pokemon.pokedex_number]: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.pokedex_number}.png`,
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
      "Normal",
      "Fire",
      "Water",
      "Electric",
      "Grass",
      "Ice",
      "Fighting",
      "Poison",
      "Ground",
      "Flying",
      "Psychic",
      "Bug",
      "Rock",
      "Ghost",
      "Dragon",
      "Dark",
      "Steel",
      "Fairy",
    ],
    datasets: [
      {
        label: "Type Coverage",
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
      "HP",
      "Attack",
      "Defense",
      "sp_attack",
      "sp_defense",
      "Speed",
    ].map((stat) => ({
      label: stat,
      data: team.map((p) => p[stat.toLowerCase()]),
      backgroundColor: getStatColor(stat),
    })),
  };

  // Graph 3: Type Balance Pie Chart
  const typeBalanceData = {
    labels: [
      ...new Set(team.flatMap((p) => [p.type1, p.type2].filter(Boolean))),
    ],
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
      "Normal",
      "Fire",
      "Water",
      "Electric",
      "Grass",
      "Ice",
      "Fighting",
      "Poison",
      "Ground",
      "Flying",
      "Psychic",
      "Bug",
      "Rock",
      "Ghost",
      "Dragon",
      "Dark",
      "Steel",
      "Fairy",
    ],
    datasets: [
      {
        label: "Team Weakness Score",
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
              options={getRadarOptions("Offensive Type Coverage")}
              height="400px"
              width="600px"
            />
          );
        case "weakness":
          return (
            <Radar
              data={teamWeaknessData}
              options={getRadarOptions("Defensive Vulnerability")}
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
          callback: (val) => (val % 50 === 0 ? val : ""),
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

  return (
    <div className="team-builder">
      <div className="team-selection">
        <h2>Create Your Team ({team.length}/6)</h2>
        <div className="pokemon-search">
          <input
            type="text"
            placeholder="Search Pokémon by name"
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
                    #{pokemon.pokedex_number} {pokemon.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="team-slots">
          {team.length === 0 ? (
            <div className="empty-team-prompt">
              <p>Your team is empty</p>
              <small>Search and add Pokémon to get started</small>
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
                        alt={team[i].name}
                      />
                      <span>
                        #{team[i].pokedex_number} {team[i].name}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromTeam(team[i].pokedex_number);
                        }}
                      >
                        <IoMdCloseCircleOutline className="remove-icon" />
                      </button>
                    </div>
                  ) : (
                    <div className="empty-slot">Slot {i + 1}</div>
                  )}
                </div>
              ))
          )}
        </div>
      </div>
      {team.length > 0 ? (
        <div className="team-analysis radar-graph">
          <div className="analysis-graph">
            <div className="radar-tabs">
              <button
                className={activeTab === "coverage" ? " active" : ""}
                onClick={() => setActiveTab("coverage")}
              >
                Type Coverage
              </button>
              <button
                className={activeTab === "weakness" ? " active" : ""}
                onClick={() => setActiveTab("weakness")}
              >
                Team Weaknesses
              </button>
              <HelpButton
                content={
                  activeTab === "coverage" ? (
                    <div>
                      <p>
                        This shows how many super-effective moves your team has
                        against each type.
                      </p>
                      <strong>Good team indicators:</strong>
                      <ul>
                        <li>Coverage across many types (wider shape)</li>
                        <li>No major gaps (no types with 0 coverage)</li>
                        <li>Multiple strong coverages (peaks above 2)</li>
                      </ul>
                    </div>
                  ) : (
                    <div>
                      <p>
                        Shows your team's average vulnerability to each type
                        (higher = worse).
                      </p>
                      <strong>Good team indicators:</strong>
                      <ul>
                        <li>Few spikes above 2x (red areas)</li>
                        <li>Balanced resistances (blue/green areas)</li>
                        <li>No single type with extreme weakness</li>
                      </ul>
                    </div>
                  )
                }
              />
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
                    High Vulnerability ({">"}2x)
                  </span>
                  <span style={{ color: "#ff9f40" }}>
                    Moderate Weakness (1-2x)
                  </span>
                  <span style={{ color: "#4bc0c0" }}>Resistant ({"<"}1x)</span>
                </div>
              )}
            </div>
          </div>
          <div className="analysis-graph type-balance">
            <div className="graph-header">
              <h3>Type Balance</h3>
              <HelpButton
                content={
                  <div>
                    <p>Shows the distribution of types in your team.</p>
                    <strong>Good team indicators:</strong>
                    <ul>
                      <li>Diverse type representation</li>
                      <li>No over-reliance on one type</li>
                      <li>Complementary type pairings</li>
                    </ul>
                    <p>Tip: Aim for 6-10 unique types across your team.</p>
                  </div>
                }
              />
              <button
                className="expand-button"
                onClick={() => setExpandedGraph("typeBalance")}
              >
                <FaExpandAlt />
              </button>
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
              <h3>Stat Distribution</h3>
              <HelpButton
                content={
                  <div>
                    <p>Compares base stats across your team members.</p>
                    <strong>Good team indicators:</strong>
                    <ul>
                      <li>Balanced stats overall</li>
                      <li>
                        Specialized roles (some high Attack, others high
                        Defense)
                      </li>
                      <li>No extreme weaknesses in any stat</li>
                    </ul>
                    <p>
                      Tip: Aim for at least 2 Pokémon with high HP/Defenses.
                    </p>
                  </div>
                }
              />
              <button
                className="expand-button"
                onClick={() => setExpandedGraph("statDistribution")}
              >
                <FaExpandAlt />
              </button>
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
                      callback: (val) => (val % 50 === 0 ? val : ""),
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
          <h3>Add Pokémon to your team to see analysis</h3>
          <p>
            Select at least one Pokémon to view type coverage, weaknesses, and
            stat distributions
          </p>
        </div>
      )}
      <GraphModal />
    </div>
  );
};

export default TeamBuilder;
