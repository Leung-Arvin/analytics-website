import './PokemonProfilePage.css';
import React, { useContext, useEffect, useState } from "react";
import { Radar } from "react-chartjs-2";
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
import { useLocation } from 'react-router-dom';
import TypeBadge from '../../components/TypeBadge/TypeBadge';
import { fetchAbilityDescription, fetchPokemonSpeciesData } from '../../utils/pokeAPIHelpers';
import Breadcrumbs from '../../components/Breadcrumbs/Breadcrumbs';
import { useTranslation } from 'react-i18next';

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
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const pokemon = useContext(PokemonDataContext)[location.pathname.split("/").pop() - 1];
  const [abilityDescriptions, setAbilityDescriptions] = useState({});
  const [pokemonImage, setPokemonImage] = useState("");
  const [localizedData, setLocalizedData] = useState({
    name: pokemon.name,
    genus: '',
    flavorText: ''
  });

  useEffect(() => {
    const fetchLocalizedData = async () => {
      try {
        const speciesData = await fetchPokemonSpeciesData(pokemon.pokedex_number);
        const currentLanguage = i18n.language;
        
        const localizedName = speciesData.names.find(
          name => name.language.name === currentLanguage
        )?.name || pokemon.name;
        
        const localizedGenus = speciesData.genera.find(
          genus => genus.language.name === currentLanguage
        )?.genus || pokemon.classfication;
        
        const localizedFlavorText = speciesData.flavor_text_entries.find(
          entry => entry.language.name === currentLanguage && 
                 (entry.version.name === 'sword' || entry.version.name === 'shield') // Prefer newer games
        )?.flavor_text || '';

        setLocalizedData({
          name: localizedName,
          genus: localizedGenus,
          flavorText: localizedFlavorText
        });
      } catch (error) {
        console.error("Error fetching localized data:", error);
      }
    };

    fetchLocalizedData();
  }, [pokemon, i18n.language]);

  useEffect(() => {
    const fetchAbilities = async () => {
      const abilities = JSON.parse(pokemon.abilities.replace(/'/g, '"'));
      const descriptions = {};
      
      for (const ability of abilities) {
        let ability_name = ability.replace(" ", "-");
        descriptions[ability] = await fetchAbilityDescription(ability_name.toLowerCase(), i18n.language);
      }
      
      setAbilityDescriptions(descriptions);
    };

    fetchAbilities();
  }, [pokemon.abilities, i18n.language]);

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
        setPokemonImage(
          `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.pokedex_number}.png`
        );
      }
    };

    fetchPokemonImage();
  }, [pokemon.name, pokemon.pokedex_number]);

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

  typeEffectiveness.weaknesses.sort((a, b) => b.multiplier - a.multiplier);

  const statsData = {
    labels: [
      t('stats.hp'),
      t('stats.attack'), 
      t('stats.defense'),
      t('stats.sp_attack'),
      t('stats.sp_defense'),
      t('stats.speed')
    ],
    datasets: [
      {
        label: t('base_stats'),
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
      <Breadcrumbs/>
      
      <div className="pokemon-header">
        {pokemonImage && (
          <img
            src={pokemonImage}
            alt={localizedData.name}
            className="pokemon-image"
          />
        )}
        <h1>
          #{pokemon.pokedex_number} {localizedData.name}{" "}
          <small>({pokemon.japanese_name})</small>
        </h1>
        <p className="classification">{localizedData.genus}</p>
        {localizedData.flavorText && (
          <p className="flavor-text">{localizedData.flavorText}</p>
        )}
        <div className="types">
          <TypeBadge type={pokemon.type1} />
          {pokemon.type2 && <TypeBadge type={pokemon.type2} />}
        </div>
      </div>

      <div className="pokemon-stats">
        <div className="stat-card">
          <h3>{t('physical_traits')}</h3>
          <p>{t('height')}: {pokemon.height_m} m</p>
          <p>{t('weight')}: {pokemon.weight_kg} kg</p>
          <p>{t('male_ratio')}: {pokemon.percentage_male || t('genderless')}</p>
        </div>

        <div className="stat-card">
          <h3>{t('battle_stats')}</h3>
          <p>{t('capture_rate')}: {pokemon.capture_rate}</p>
          <p>{t('base_happiness')}: {pokemon.base_happiness}</p>
          <p>{t('legendary')}: {pokemon.is_legendary === "0" ? t('no') : t('yes')}</p>
        </div>
      </div>

      <div className="pokemon-abilities">
        <h3>{t('abilities')}</h3>
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
          <h3>{t('base_stats')}</h3>
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
            <h3>{t('weaknesses')}</h3>
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
            <h3>{t('resistances')}</h3>
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
              <h3>{t('immunities')}</h3>
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