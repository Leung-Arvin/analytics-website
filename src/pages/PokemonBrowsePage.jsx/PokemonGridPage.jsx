import React, { useState, useEffect, useMemo, useContext } from 'react';
import './PokemonGridPage.css';
import { getApiName } from '../../utils/pokeAPIHelpers';
import TypeBadge from '../../components/TypeBadge/TypeBadge';
import { PokemonDataContext } from '../../contexts/PokemonDataContext';
import { useNavigate } from 'react-router';

const PokemonGridPage = () => {
  const navigate = useNavigate();
  const pokemonData = useContext(PokemonDataContext)
  const [displayedSprites, setDisplayedSprites] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 16;
  

  const filteredPokemon = useMemo(() => {
    return searchTerm
      ? pokemonData.filter(pokemon => 
          pokemon.name?.toLowerCase().includes(searchTerm.toLowerCase()))
      : pokemonData;
  }, [searchTerm, pokemonData]);

  const currentItems = useMemo(() => {
    return filteredPokemon.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [currentPage, filteredPokemon, itemsPerPage]);

  // Fetch sprites for current items only
  useEffect(() => {
    const fetchSprites = async () => {
      setLoading(true);
      const newSprites = { ...displayedSprites };

      await Promise.all(
        currentItems.map(async (pokemon) => {
          if (!newSprites[pokemon.pokedex_number]) {
            try {
              const response = await fetch(
                `https://pokeapi.co/api/v2/pokemon/${getApiName(pokemon.name)}`
              );
              const data = await response.json();
              newSprites[pokemon.pokedex_number] = 
                data.sprites.other['official-artwork'].front_default || 
                `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.pokedex_number}.png`;
            } catch (error) {
              newSprites[pokemon.pokedex_number] =
                `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.pokedex_number}.png`;
            }
          }
        })
      );

      setDisplayedSprites(newSprites);
      setLoading(false);
    };

    fetchSprites();
  }, [currentItems]); 

  const totalPages = Math.ceil(filteredPokemon.length / itemsPerPage);

  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  return (
    <div className="pokemon-grid-page">
      <h1 className='pokedex-title'>Pokémon Directory</h1>
      <p>Welcome to the pokedex! Click on a pokemon to learn more about them or search one by their name.</p>
      
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search all Pokémon..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reset to first page on search
          }}
        />
      </div>

      {loading ? (
        <div className="loading"> <img src="Running-Pikachu-GIF.webp"/><p>Loading sprites...</p></div>
      ) : (
        <>
          <div className="pokemon-grid">
            {currentItems.length > 0 ? (
              currentItems.map((pokemon) => (
                <div key={pokemon.pokedex_number} className="pokemon-card" onClick={() => navigate(`/pokemon/${pokemon.pokedex_number}`)}>
                  <img
                    src={displayedSprites[pokemon.pokedex_number] || 
                         `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.pokedex_number}.png`}
                    alt={pokemon.name}
                    className="pokemon-sprite"
                    onError={(e) => {
                      e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.pokedex_number}.png`;
                    }}
                  />
                  <p className="pokemon-name">
                    #{pokemon.pokedex_number} {pokemon.name}
                  </p>
                  <div className='pokemon-types'>
                  <TypeBadge type={pokemon.type1}/>
                  {pokemon.type2 && <TypeBadge type={pokemon.type2}/>}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">No Pokémon found matching "{searchTerm}"</div>
            )}
          </div>

          <div className="pagination">
            <button onClick={prevPage} disabled={currentPage === 1}>
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages} ({filteredPokemon.length} results)
            </span>
            <button onClick={nextPage} disabled={currentPage === totalPages}>
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PokemonGridPage;