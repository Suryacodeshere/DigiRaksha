import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import './Alert.css';

const Alert = ({ 
  isOpen, 
  onClose, 
  type = 'success', 
  title, 
  message, 
  autoClose = true, 
  autoCloseDelay = 5000,
  showCloseButton = true 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      
      if (autoClose && autoCloseDelay > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, autoCloseDelay);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, autoClose, autoCloseDelay]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation to complete
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={24} />;
      case 'error':
        return <AlertTriangle size={24} />;
      case 'warning':
        return <AlertTriangle size={24} />;
      case 'info':
        return <Info size={24} />;
      default:
        return <CheckCircle size={24} />;
    }
  };

  const getTypeClass = () => {
    switch (type) {
      case 'success':
        return 'alert-success';
      case 'error':
        return 'alert-error';
      case 'warning':
        return 'alert-warning';
      case 'info':
        return 'alert-info';
      default:
        return 'alert-success';
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`alert-overlay ${isVisible ? 'alert-overlay-visible' : ''}`}>
      <div className={`alert-popup ${getTypeClass()} ${isVisible ? 'alert-popup-visible' : ''}`}>
        {showCloseButton && (
          <button 
            className="alert-close" 
            onClick={handleClose}
            aria-label="Close alert"
          >
            <X size={18} />
          </button>
        )}
        
        <div className="alert-content">
          <div className="alert-icon">
            {getIcon()}
          </div>
          
          <div className="alert-text">
            {title && <h3 className="alert-title">{title}</h3>}
            <p className="alert-message">{message}</p>
          </div>
        </div>
        
        {autoClose && (
          <div 
            className="alert-progress" 
            style={{ animationDuration: `${autoCloseDelay}ms` }}
          />
        )}
      </div>
    </div>
  );
};

export default Alert;