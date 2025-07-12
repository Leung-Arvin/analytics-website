import './PokemonProfilePage.css';
import React, { useContext, useEffect, useState } from "react";
import { Radar, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { PokemonDataContext } from '../../contexts/PokemonDataContext';
import { useLocation } from 'react-router';
import  TypeBadge from '../../components/TypeBadge/TypeBadge'
import { fetchAbilityDescription } from '../../utils/pokeAPIHelpers';

// Register ChartJS components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);



const PokemonProfilePage = () => {
  let location = useLocation();
  let pokemon = useContext(PokemonDataContext)[location.pathname.split("/").pop() - 1];
  const [abilityDescriptions, setAbilityDescriptions] = useState({});

  useEffect(() => {
    const fetchAbilities = async () => {
      const abilities = JSON.parse(pokemon.abilities.replace(/'/g, '"'));
      const descriptions = {};
      
      for (const ability of abilities) {
        let ability_name = ability.replace(" ", "-");
        descriptions[ability] = await fetchAbilityDescription(ability_name.toLowerCase());
      }
      
      setAbilityDescriptions(descriptions);
    };

    fetchAbilities();
  }, [pokemon.abilities]);
  const [pokemonImage, setPokemonImage] = useState("");

  // Fetch Pokémon image from PokeAPI
  useEffect(() => {
    const fetchPokemonImage = async () => {
      try {
        const response = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${pokemon.name.toLowerCase()}`
        );
        const data = await response.json();
        setPokemonImage(data.sprites.other["official-artwork"].front_default);
      } catch (error) {
        console.error("Failed to fetch Pokémon image:", error);
        // Fallback to a generic sprite if needed
        setPokemonImage(
          `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.pokedex_number}.png`
        );
      }
    };

    fetchPokemonImage();
  }, [pokemon.name, pokemon.pokedex_number]);

  // Format weaknesses data for the bar chart
  const typeEffectiveness = Object.keys(pokemon)
  .filter(key => key.startsWith("against_"))
  .reduce((acc, key) => {
    const type = key.replace("against_", "");
    const multiplier = parseFloat(pokemon[key]);
    
    if (multiplier > 1) {
      acc.weaknesses.push({ type, multiplier });
    } else if (multiplier < 1 && multiplier > 0) {
      acc.resistances.push({ type, multiplier });
    } else if (multiplier === 0) {
      acc.immunities.push(type);
    }
    return acc;
  }, { weaknesses: [], resistances: [], immunities: [] });

// Sort weaknesses by multiplier (highest first)
typeEffectiveness.weaknesses.sort((a, b) => b.multiplier - a.multiplier);

  // Radar chart data for stats
  const statsData = {
    labels: ["HP", "Attack", "Defense", "Sp. Attack", "Sp. Defense", "Speed"],
    datasets: [
      {
        label: "Base Stats",
        data: [
          pokemon.hp,
          pokemon.attack,
          pokemon.defense,
          pokemon.sp_attack,
          pokemon.sp_defense,
          pokemon.speed,
        ],
        backgroundColor: "rgba(147, 197, 114, 0.2)",
        borderColor: "rgba(147, 197, 114, 1)",
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="pokemon-profile">
      <div className="pokemon-header">
        {pokemonImage && (
          <img
            src={pokemonImage}
            alt={pokemon.name}
            className="pokemon-image"
          />
        )}
        <h1>
          #{pokemon.pokedex_number} {pokemon.name}{" "}
          <small>({pokemon.japanese_name})</small>
        </h1>
        <p className="classification">{pokemon.classfication}</p>
        <div className="types">
          <TypeBadge type={pokemon.type1} />
          {pokemon.type2 && (
            <TypeBadge type={pokemon.type2} />
          )}
        </div>
      </div>

      <div className="pokemon-stats">
        <div className="stat-card">
          <h3>Physical Traits</h3>
          <p>Height: {pokemon.height_m} m</p>
          <p>Weight: {pokemon.weight_kg} kg</p>
          <p>Male Ratio: {pokemon.percentage_male || "Genderless"}</p>
        </div>

        <div className="stat-card">
          <h3>Battle Stats</h3>
          <p>Capture Rate: {pokemon.capture_rate}</p>
          <p>Base Happiness: {pokemon.base_happiness}</p>
          <p>Legendary: {pokemon.is_legendary === "0" ? "No" : "Yes"}</p>
        </div>
      </div>

      <div className="pokemon-abilities">
        <h3>Abilities</h3>
        <ul>
          {JSON.parse(pokemon.abilities.replace(/'/g, '"')).map((ability) => (
            <li key={ability}>
              <div className="ability-name">{ability}</div>
              {abilityDescriptions[ability] && (
                <div className="ability-description">
                  {abilityDescriptions[ability]}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="pokemon-charts">
        <div className="chart-container">
          <h3>Base Stats</h3>
          <Radar
            data={statsData}
            options={{
              scales: {
                r: {
                  pointLabels: {
                    color: "white",
                  },
                  angleLines: { color: "rgba(255, 255, 255, 0.2)" },
                  grid: { color: "rgba(255, 255, 255, 0.2)" },
                  suggestedMin: 0,
                  suggestedMax: 200,
                  ticks: {
                    callback: (value) => `${value}`,
                    stepSize: 50,
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
        </div>

        <div className="type-effectiveness">
        <div className="effectiveness-section">
          <h3>Weaknesses</h3>
          <div className="type-badge-group">
            {typeEffectiveness.weaknesses.map(({ type, multiplier }) => (
              <div key={type} className="type-effectiveness-badge">
                <TypeBadge type={type} />
                <span className="multiplier">×{multiplier}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="effectiveness-section">
          <h3>Resistances</h3>
          <div className="type-badge-group">
            {typeEffectiveness.resistances.map(({ type, multiplier }) => (
              <div key={type} className="type-effectiveness-badge">
                <TypeBadge type={type} />
                <span className="multiplier">×{multiplier}</span>
              </div>
            ))}
          </div>
        </div>

        {typeEffectiveness.immunities.length > 0 && (
          <div className="effectiveness-section">
            <h3>Immunities</h3>
            <div className="type-badge-group">
              {typeEffectiveness.immunities.map(type => (
                <div key={type} className="type-effectiveness-badge">
                  <TypeBadge type={type} />
                  <span className="multiplier">×0</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};


export default PokemonProfilePage;