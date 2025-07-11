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
  const weaknessData = {
    labels: Object.keys(pokemon)
      .filter((key) => key.startsWith("against_"))
      .map((key) => key.replace("against_", "")),
    datasets: [
      {
        label: "Damage Taken (1 = Normal)",
        data: Object.keys(pokemon)
          .filter((key) => key.startsWith("against_"))
          .map((key) => parseFloat(pokemon[key])),
        backgroundColor: (ctx) => {
          const value = ctx.raw;
          return value > 1
            ? "rgba(255, 99, 132, 0.6)" // Weaknesses (red)
            : value < 1
            ? "rgba(75, 192, 192, 0.6)" // Resistances (green)
            : "rgba(255, 206, 86, 0.6)"; // Neutral (yellow)
        },
        borderWidth: 1,
      },
    ],
  };

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
          {JSON.parse(pokemon.abilities.replace(/'/g, '"')).map(
            (ability, index) => (
              <li key={index}>{ability}</li>
            )
          )}
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
                  angleLines: { display: true },
                  suggestedMin: 0,
                  suggestedMax: 255,
                },
              },
            }}
          />
        </div>

        <div className="chart-container">
          <h3>Type Weaknesses/Resistances</h3>
          <Bar
            data={weaknessData}
            options={{
              scales: {
                y: {
                  beginAtZero: true,
                  title: { display: true, text: "Damage Multiplier" },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};


export default PokemonProfilePage;