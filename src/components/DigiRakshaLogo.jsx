import React from 'react';
import logoSvg from '../assets/digi-raksha-robot-logo.svg';

const DigiRakshaLogo = ({ size = 24, className = '', ...props }) => {
  return (
    <img 
      src={logoSvg} 
      alt="Digi Raksha Assistant" 
      width={size} 
      height={size}
      className={className}
      style={{ 
        objectFit: 'contain',
        ...props.style 
      }}
      {...props}
    />
  );
};

export default DigiRakshaLogo;