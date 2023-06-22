import React from 'react';
import './Node.css';

const Node = ({ row, col, isStart, isEnd, isWall, onMouseDown, onMouseEnter, onMouseUp }) => {
  const nodeClass = isStart
    ? 'node-start'
    : isEnd
    ? 'node-end'
    : isWall
    ? 'node-wall'
    : '';

  return (
    <div
      className={`node ${nodeClass}`}
      id={`node-${row}-${col}`}
      onMouseDown={() => onMouseDown(row, col)}
      onMouseEnter={() => onMouseEnter(row, col)}
      onMouseUp={onMouseUp}
    ></div>
  );
};

export default Node;
