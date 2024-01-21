// App.js
import React, { useState } from 'react';
import './App.css';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);

  const handleSearch = async () => {
    try {
      const response = await fetch('http://localhost:5000/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ search_query: searchQuery }),
      });

      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };

  // console.log(searchQuery)

  return (
    <div className="App">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>

      {searchResults && (
        <div>
          <h2>Search Results:</h2>
          <p>{searchResults.woot.Title}</p>
          <p><b>Evetech Price : R{searchResults.evetech.Price}</b></p>
          <p><b>Wootware Price : R{searchResults.woot.Price}</b></p>
          <p><b>DreamwareTech Price : R{searchResults.dreamwaretech.Price}</b></p>
          <p><b>Takealot Price : R{searchResults.takealot.Price}</b></p>
          <p><b>RebelTech Price : R{searchResults.rebel.Price}</b></p>
        </div>
      )}
    </div>
  );
}

export default App;
