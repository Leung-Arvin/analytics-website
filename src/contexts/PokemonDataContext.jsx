// contexts/PokemonDataContext.jsx
import { createContext } from 'react';

export const PokemonDataContext = createContext();

export const PokemonDataProvider = ({ children, pokemonData }) => {
  return (
    <PokemonDataContext.Provider value={pokemonData}>
      {children}
    </PokemonDataContext.Provider>
  );
};