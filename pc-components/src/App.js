import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [currentTime, setCurrentTime] = useState({});

  useEffect(() => {
    fetch('/api').then(res => res.json()).then(data => {
      setCurrentTime(data);
    });
  }, []);

  return (
    <div className="App">
      <h1>
        Wootware Search Results : 
      </h1>
        <p>{currentTime.woot}</p>
        <h1>
        Evetech Search Results : 
      </h1>
        <p>{currentTime.evetech}</p>
    </div>
  );
}

export default App;