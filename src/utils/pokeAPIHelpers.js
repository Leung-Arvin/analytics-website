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

export const fetchAbilityDescription = async (abilityName) => {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/ability/${abilityName}/`);
    const data = await response.json();
    
    // Find English description
    const englishEntry = data.effect_entries.find(
      entry => entry.language.name === 'en'
    );
    
    return englishEntry ? englishEntry.effect : 'Description not available';
  } catch (error) {
    console.error(`Error fetching ability ${abilityName}:`, error);
    return 'Description not available';
  }
};