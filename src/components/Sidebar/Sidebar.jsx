import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';
import PokeLogo from '/pokeball_logo.png';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';

const Sidebar = () => {
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const menuItems = [
    { path: '/team-builder', icon: '📊', label: 'Team Builder' },
    { path: '/pokedex', icon: '🔍', label: 'Pokédex' },
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' }
  ];

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Collapse Toggle Button */}
      <button 
        className="sidebar-toggle"
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? <FaAngleRight /> : <FaAngleLeft />}
      </button>

      <div className="sidebar-content">
        <div className="logo-container">
          <img src={PokeLogo} alt="Pokémon Logo" className="logo" />
          {!isCollapsed && <h2>PokéAnalytics</h2>}
          <hr/>
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item) => (
              <li 
                key={item.path} 
                className={ location.pathname.includes(item.path) ? 'active' : ''}
              >
                <Link to={item.path}>
                  <span className="nav-icon">{item.icon}</span>
                  {!isCollapsed && (
                    <span className="nav-label">{item.label}</span>
                  )}
                  {isCollapsed && (
                    <span className="tooltip">{item.label}</span>
                  )}
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
              {!isCollapsed && (
                <>
                  <span>{selectedLanguage}</span>
                  <span className={`dropdown-arrow ${showLanguageDropdown ? 'open' : ''}`}>▼</span>
                </>
              )}
            </div>
            
            {showLanguageDropdown && !isCollapsed && (
              <div className="language-dropdown">
                {languages.map((language) => (
                  <div
                    key={language.code}
                    className="language-option"
                    onClick={() => {
                      setSelectedLanguage(language.name);
                      setShowLanguageDropdown(false);
                    }}
                  >
                    <span>{language.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;