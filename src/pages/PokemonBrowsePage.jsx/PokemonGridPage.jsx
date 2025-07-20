import React, { useState, useEffect, useMemo, useContext } from 'react';
import './PokemonGridPage.css';
import { getApiName, fetchPokemonSpeciesData } from '../../utils/pokeAPIHelpers';
import TypeBadge from '../../components/TypeBadge/TypeBadge';
import { PokemonDataContext } from '../../contexts/PokemonDataContext';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const PokemonGridPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const pokemonData = useContext(PokemonDataContext);
  const [displayedSprites, setDisplayedSprites] = useState({});
  const [localizedNames, setLocalizedNames] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 16;

  const filteredPokemon = useMemo(() => {
    return searchTerm
      ? pokemonData.filter(pokemon => {
          const nameToCheck = localizedNames[pokemon.pokedex_number]?.name || pokemon.name;
          return nameToCheck.toLowerCase().includes(searchTerm.toLowerCase());
        })
      : pokemonData;
  }, [searchTerm, pokemonData, localizedNames]);

  const currentItems = useMemo(() => {
    return filteredPokemon.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [currentPage, filteredPokemon, itemsPerPage]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const newSprites = { ...displayedSprites };
      const newLocalizedNames = { ...localizedNames };

      await Promise.all(
        currentItems.map(async (pokemon) => {
          try {
            if (!newSprites[pokemon.pokedex_number]) {
              const response = await fetch(
                `https://pokeapi.co/api/v2/pokemon/${getApiName(pokemon.name)}`
              );
              const data = await response.json();
              newSprites[pokemon.pokedex_number] = 
                data.sprites.other['official-artwork'].front_default || 
                `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.pokedex_number}.png`;
            }

            if (!newLocalizedNames[pokemon.pokedex_number] || 
                newLocalizedNames[pokemon.pokedex_number].language !== i18n.language) {
              const speciesData = await fetchPokemonSpeciesData(pokemon.pokedex_number);
              const localizedName = speciesData.names.find(
                name => name.language.name === i18n.language
              )?.name || pokemon.name;
              
              newLocalizedNames[pokemon.pokedex_number] = {
                name: localizedName,
                language: i18n.language
              };
            }
          } catch (error) {
            console.error(`Error loading data for Pokemon ${pokemon.pokedex_number}:`, error);
            if (!newSprites[pokemon.pokedex_number]) {
              newSprites[pokemon.pokedex_number] =
                `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.pokedex_number}.png`;
            }
            if (!newLocalizedNames[pokemon.pokedex_number]) {
              newLocalizedNames[pokemon.pokedex_number] = {
                name: pokemon.name,
                language: i18n.language
              };
            }
          }
        })
      );

      setDisplayedSprites(newSprites);
      setLocalizedNames(newLocalizedNames);
      setLoading(false);
    };

    fetchData();
  }, [currentItems, i18n.language]);

  const totalPages = Math.ceil(filteredPokemon.length / itemsPerPage);

  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  return (
    <div className="pokemon-grid-page">
      <h1 className='pokedex-title'>{t('pokedex.title')}</h1>
      <p>{t('pokedex.welcome_message')}</p>
      
      <div className="search-bar">
        <input
          type="text"
          placeholder={t('pokedex.search_placeholder')}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); 
          }}
        />
      </div>

      {loading ? (
        <div className="loading">
          <img src="Running-Pikachu-GIF.webp" alt={t('loading')}/>
          <p>{t('loading_sprites')}</p>
        </div>
      ) : (
        <>
          <div className="pokemon-grid">
            {currentItems.length > 0 ? (
              currentItems.map((pokemon) => (
                <Link
                  to={`/pokemon/${pokemon.pokedex_number}`}
                  state={{ from: '/pokedex' }}
                  className="global-link"
                  key={pokemon.pokedex_number}
                >
                  <div className="pokemon-card">
                    <img
                      src={displayedSprites[pokemon.pokedex_number] || 
                          `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.pokedex_number}.png`}
                      alt={localizedNames[pokemon.pokedex_number]?.name || pokemon.name}
                      className="pokemon-sprite"
                      onError={(e) => {
                        e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.pokedex_number}.png`;
                      }}
                    />
                    <p className="pokemon-name">
                      #{pokemon.pokedex_number} {localizedNames[pokemon.pokedex_number]?.name || pokemon.name}
                    </p>
                    <div className='pokemon-types'>
                      <TypeBadge type={pokemon.type1}/>
                      {pokemon.type2 && <TypeBadge type={pokemon.type2}/>}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="no-results">
                {t('pokedex.no_results', { searchTerm })}
              </div>
            )}
          </div>

          <div className="pagination">
            <button onClick={prevPage} disabled={currentPage === 1}>
              {t('pagination.previous')}
            </button>
            <span>
              {t('pagination.page_info', {
                current: currentPage,
                total: totalPages,
                count: filteredPokemon.length
              })}
            </span>
            <button onClick={nextPage} disabled={currentPage === totalPages}>
              {t('pagination.next')}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PokemonGridPage;