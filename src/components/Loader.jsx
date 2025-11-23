import React from 'react';
//import './styles/Loader.css';

export default function Loader() {
  return (
    <div className="loader-container">
      <div className="satsui-loader">
        <div className="spinner-circle"></div>
        <div className="glow-effect"></div>
        <div className="particle p1"></div>
        <div className="particle p2"></div>
        <div className="particle p3"></div>
      </div>
      <p className="loading-text">Cargando...</p>
    </div>
  );
}