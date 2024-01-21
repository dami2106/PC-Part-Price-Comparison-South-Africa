import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [currentData, setCurrentData] = useState({});
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    fetch("/api")
      .then((res) => res.json())
      .then((data) => {
        setCurrentData(data);
      });
  }, []);

  const handleChange = (e) => {
    e.preventDefault();
    setSearchInput(e.target.value);
  };

  console.log(searchInput);

  return (
    <div className="App">

      <input
        type="text"
        placeholder="Search here"
        onChange={handleChange}
        value={searchInput}
      />

      {currentData && (
        <div>
          {Object.keys(currentData).map((key) => (
            <div key={key}>
              <p>{currentData[key]}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
