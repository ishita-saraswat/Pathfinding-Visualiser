import React, { useState, useEffect } from 'react';
import './Grid.css';

const Grid = ({ startNode, endNode }) => {
  const [grid, setGrid] = useState([]);

  useEffect(() => {
    const initialGrid = createGrid();
    setGrid(initialGrid);
  }, []);

  const createGrid = () => {
    // Grid creation logic goes here
  };

  return (
    <div className="grid">
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="row">
          {row.map((node, colIndex) => (
            <div
              key={colIndex}
              className={`cell ${node === startNode ? 'start' : ''} ${
                node === endNode ? 'end' : ''
              }`}
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Grid;
