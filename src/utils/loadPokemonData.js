import Papa from 'papaparse'; 

export const loadPokemonData = async () => {
  try {
    const response = await fetch('/data/pokemon.csv');
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        complete: (results) => resolve(results.data),
        error: (error) => reject(error)
      });
    });
  } catch (error) {
    console.error('Error loading Pokemon data:', error);
    return [];
  }
};