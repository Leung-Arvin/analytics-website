import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { loadPokemonData } from './utils/loadPokemonData'
import PokemonProfilePage from './pages/PokemonProfilePage/PokemonProfilePage'
import PokemonGridPage from './pages/PokemonBrowsePage.jsx/PokemonGridPage'
import Sidebar from './components/Sidebar/Sidebar'
import { Outlet } from 'react-router'
import { PokemonDataProvider } from './contexts/PokemonDataContext'

function App() {
  const [pokemonData, setPokemonData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const data = await loadPokemonData();
      setPokemonData(data);
      setIsLoading(false);
    };
    
    fetchData();
  }, []);

  if (isLoading) return <div> <img src="Running-Pikachu-GIF.webp"/></div>;

  return (
    <>
      <PokemonDataProvider pokemonData={pokemonData}>
      <div className='app-container'>
      <Sidebar />
      </div>
      <div className='main-container'>
        <Outlet/>
      </div>
      </PokemonDataProvider>
    </>
  )
}

export default App
