import React from 'react';
import MasterApp from './Componentes/MasterApp';

const App = () => {
  return (
    <div className="app">
      <header>
        <h1>WebRTC Screen Sharing</h1>
      </header>
      <main>
        <MasterApp />
      </main>
      <footer>
        <p>let's bora</p>
      </footer>
    </div>
  );
};

export default App;
