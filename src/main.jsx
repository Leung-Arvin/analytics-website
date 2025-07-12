// main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
// import AnalyticsPage from './pages/Analytics';
// import PokedexPage from './pages/Pokedex';
import './index.css';
import App from './App';
import PokemonGridPage from './pages/PokemonBrowsePage.jsx/PokemonGridPage';
import { fetchPokemonById } from './utils/pokeAPIHelpers';
import PokemonProfilePage from './pages/PokemonProfilePage/PokemonProfilePage';
import TeamBuilder from './pages/PokemonTeamBuilder.jsx/TeamBuilder';


const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true, 
        element: <Navigate to="/team-builder" replace />,
      },
      {
        path: 'team-builder',
        element: <TeamBuilder />,
      },
      {
        path: 'pokedex',
        element: <PokemonGridPage />,
      },
      {
        path: 'pokemon/:id',
        element: <PokemonProfilePage/>,
        loader: ({params}) => {
          return fetchPokemonById(params.id);
        }
      }
    ],
  },
]);



ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);