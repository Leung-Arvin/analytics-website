export const getApiName = (name) => {
  if (name === "Nidoran♀") return "nidoran-f";
  if (name === "Nidoran♂") return "nidoran-m";
  return name.toLowerCase();
};

export const fetchPokemonById = async (id) => {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  if (!response.ok) throw new Error('Pokémon not found');
  return response.json();
};

export const fetchAbilityDescription = async (abilityName, language = 'en') => {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/ability/${abilityName}/`);
    const data = await response.json();
    
    // Find the description in the specified language
    const description = data.flavor_text_entries.find(
      entry => entry.language.name === language
    )?.flavor_text;
    
    return description || data.flavor_text_entries.find(
      entry => entry.language.name === 'en'
    )?.flavor_text || 'Description not available';
  } catch (error) {
    console.error(`Error fetching ability ${abilityName}:`, error);
    return 'Description not available';
  }
};

export const fetchPokemonSpeciesData = async (pokemonId) => {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}/`);
  return await response.json();
};