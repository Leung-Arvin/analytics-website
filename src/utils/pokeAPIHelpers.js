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