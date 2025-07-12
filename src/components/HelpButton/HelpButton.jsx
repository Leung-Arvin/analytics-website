import { useState } from "react";
import './HelpButton.css'
export const HelpButton = ({ content }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="help-button-container">
      <button 
        className="help-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Help"
      >
        ?
      </button>
      {isOpen && (
        <div className="help-tooltip">
          {content}
          <button 
            className="close-help"
            onClick={() => setIsOpen(false)}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};