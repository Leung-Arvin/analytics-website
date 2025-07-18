import React from 'react';
import './TypeBadge.css';
import { useTranslation } from 'react-i18next';

const TypeBadge = ({ type }) => {
  const {t} = useTranslation();
  // Type color mappings (official Pokémon colors)
  const typeColors = {
    normal: '#A8A878',
    fire: '#F08030',
    water: '#6890F0',
    electric: '#F8D030',
    grass: '#78C850',
    ice: '#98D8D8',
    fight: '#c90e0e',
    poison: '#A040A0',
    ground: '#E0C068',
    flying: '#A890F0',
    psychic: '#F85888',
    bug: '#A8B820',
    rock: '#B8A038',
    ghost: '#705898',
    dragon: '#7038F8',
    dark: '#705848',
    steel: '#B8B8D0',
    fairy: '#EE99AC',
  };

  return (
    <span 
      className="type-badge"
      style={{ backgroundColor: typeColors[type.toLowerCase()] || '#777' }}
    >
      {t(`types.${type}`)}
    </span>
  );
};

export default TypeBadge;