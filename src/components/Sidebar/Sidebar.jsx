import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';
import PokeLogo from '/pokeball_logo.png';
import { FaAngleLeft, FaAngleRight, FaAngleUp } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const Sidebar = () => {
  const { t, i18n } = useTranslation();
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const menuItems = [
    { path: '/team-builder', icon: '📊', label: t('sidebar.team_builder') },
    { path: '/pokedex', icon: '🔍', label: t('sidebar.pokedex') },
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
  ];

  const handleLanguageChange = (languageCode) => {
    i18n.changeLanguage(languageCode);
    setShowLanguageDropdown(false);
  };

  const currentLanguageName = languages.find(lang => lang.code === i18n.language)?.name || 'English';

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <button 
        className="sidebar-toggle"
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-label={isCollapsed ? t('sidebar.expand') : t('sidebar.collapse')}
      >
        {isCollapsed ? <FaAngleRight /> : <FaAngleLeft />}
      </button>

      <div className="sidebar-content">
        <div className="logo-container">
          <img src={PokeLogo} alt="Pokémon Logo" className="logo" />
          {!isCollapsed && <h2>{t('sidebar.title')}</h2>}
          <hr/>
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item) => (
              <li 
                key={item.path} 
                className={location.pathname.includes(item.path) ? 'active' : ''}
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
              <span className="globe-icon">🌐</span>
              {!isCollapsed && (
                <>
                  <span>{currentLanguageName}</span>
                  <span className={`dropdown-arrow ${showLanguageDropdown ? 'open' : ''}`}>
                    <FaAngleUp/>
                  </span>
                </>
              )}
            </div>
            
            {showLanguageDropdown && !isCollapsed && (
              <div className="language-dropdown">
                {languages.map((language) => (
                  <div
                    key={language.code}
                    className={`language-option ${i18n.language === language.code ? 'selected' : ''}`}
                    value={language.code}
                    onClick={() => handleLanguageChange(language.code)}
                  >
                    {language.name}
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