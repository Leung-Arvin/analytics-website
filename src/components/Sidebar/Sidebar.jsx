import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';
import PokeLogo from '/pokeball_logo.png';

const Sidebar = () => {
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const location = useLocation();

  const menuItems = [
    { path: '/analytics', icon: '📊', label: 'Analytics' },
    { path: '/pokedex', icon: '🔍', label: 'Pokédex' },
  ];

  const languages = [
    { code: 'en', name: 'English',  },
    { code: 'fr', name: 'Français',  }
  ];

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language.name);
    setShowLanguageDropdown(false);
    // Add your language change logic here (i18n implementation)
    console.log('Language changed to:', language.code);
  };
 

  return (
    <div className="sidebar">
      <div className="logo-container">
        <img src={PokeLogo} alt="Pokémon Logo" className="logo" />
        <h2>PokéAnalytics</h2>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => (
            <li 
              key={item.path} 
              className={location.pathname === item.path ? 'active' : ''}
            >
              <Link to={item.path}>
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div 
          className="language-selector"
          onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
        >
          <div className="language-current">
            <img src="/globe_icon.png" alt="Language" className="globe-icon" />
            <span>{selectedLanguage}</span>
            <span className={`dropdown-arrow ${showLanguageDropdown ? 'open' : ''}`}>▼</span>
          </div>
          
          {showLanguageDropdown && (
            <div className="language-dropdown">
              {languages.map((language) => (
                <div
                  key={language.code}
                  className="language-option"
                  onClick={() => handleLanguageChange(language)}
                >
                  <span className="language-flag">{language.flag}</span>
                  <span>{language.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;