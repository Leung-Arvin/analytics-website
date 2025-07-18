import './Breadcrumbs.css';
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaChevronRight } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const Breadcrumbs = () => {
  const {t} = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  
  const fromPage = location.state?.from;

  const handleBack = () => {
    if (fromPage) {
      navigate(fromPage);
    } else {
      navigate(-1); 
    }
  };

  return (
    <div className="breadcrumbs">
      {fromPage && (
        <button onClick={handleBack} className="breadcrumb-back">
          {t('breadcrumbs.back_to')} {fromPage.includes('team-builder') ? t('breadcrumbs.team_builder') : t('breadcrumbs.pokedex')}
        </button>
      )}
    </div>
  );
};

export default Breadcrumbs;