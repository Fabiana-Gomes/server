import React from 'react';
import MasterApp from './Componentes/MasterApp';

const App = () => {
  return (
    <div className="app">
      <header>
        <h1>WebRTC Screen Sharing</h1>
      </header>
      <main>
        {/* Renderiza o componente MasterApp, que controla a funcionalidade de "master" */}
        <MasterApp />
      </main>
      <footer>
        <p>Desenvolvido com React e WebRTC</p>
      </footer>
    </div>
  );
};

export default App;
