import React, { useState, useEffect, useRef } from 'react';
import Node from './Node';
import './Visualizer.css';

const Visualizer = () => {
  const [grid, setGrid] = useState([]);
  const [mouseIsPressed, setMouseIsPressed] = useState(false);
  const [startNode, setStartNode] = useState(null);
  const [endNode, setEndNode] = useState(null);
  const isVisualizingRef = useRef(false);
  const [initialGridSet, setInitialGridSet] = useState(false);

  useEffect(() => {
    initializeGrid();
  }, []);

  const initializeGrid = () => {
    const initialGrid = [];
    for (let row = 0; row < 50; row++) {
      const currentRow = [];
      for (let col = 0; col < 50; col++) {
        currentRow.push(createNode(col, row));
      }
      initialGrid.push(currentRow);
    }
    setGrid(initialGrid);
    setInitialGridSet(true); 
  };

  //node object
  const createNode = (col, row) => {
    return {
      col,
      row,
      distance: Infinity,
      isVisited: false,
      isWall: false,
      previousNode: null,
      isStart: false,
      isEnd: false,
    };
  };

  //mouse events on the grid
  const handleMouseDown = (row, col) => {
    if (isVisualizingRef.current) return;
    if (grid[row][col].isStart) {
      setMouseIsPressed('start');
    } else if (grid[row][col].isEnd) {
      setMouseIsPressed('end');
    } else {
      const newGrid = getNewGridWithWallToggled(grid, row, col);
      setGrid(newGrid);
      setMouseIsPressed('wall');
    }
  };

  const handleMouseEnter = (row, col) => {
    if (isVisualizingRef.current) return;
    if (!mouseIsPressed) return;

    const newGrid = [...grid];
    const node = newGrid[row][col];

    if (mouseIsPressed === 'start') {
      const updatedGrid = getNewGridWithUpdatedStartNode(newGrid, row, col);
      setGrid(updatedGrid);
    } else if (mouseIsPressed === 'end') {
      const updatedGrid = getNewGridWithUpdatedEndNode(newGrid, row, col);
      setGrid(updatedGrid);
    } else if (mouseIsPressed === 'wall') {
      if (initialGridSet && !node.isStart && !node.isEnd && !node.isWall) {
        const updatedGrid = getNewGridWithWallToggled(newGrid, row, col);
        setGrid(updatedGrid);
      }
    }
  };

  const handleMouseUp = () => {
    if (isVisualizingRef.current) return;
    setMouseIsPressed(false);
  };

  //Toggle
  const getNewGridWithWallToggled = (grid, row, col) => {
    const newGrid = [...grid];
    const node = newGrid[row][col];
    const newNode = {
      ...node,
      isWall: !node.isWall,
    };
    newGrid[row][col] = newNode;
    return newGrid;
  };

  //node properties based on mouse events
  const getNewGridWithUpdatedNode = (grid, row, col) => {
    const newGrid = [...grid];
    const node = newGrid[row][col];
    let newNode;

    if (mouseIsPressed === 'wall') {
      newNode = {
        ...node,
        isWall: !node.isWall,
      };
    }

    newGrid[row][col] = newNode;
    return newGrid;
  };

  const getNewGridWithUpdatedStartNode = (grid, row, col) => {
    const newGrid = [...grid];
    const node = newGrid[row][col];
    const newNode = {
      ...node,
      isStart: true,
      isEnd: false,
    };
    const prevStartNode = startNode;
    if (prevStartNode !== null) {
      const prevStartNodeRow = prevStartNode.row;
      const prevStartNodeCol = prevStartNode.col;
      newGrid[prevStartNodeRow][prevStartNodeCol] = {
        ...prevStartNode,
        isStart: false,
      };
    }
    newGrid[row][col] = newNode;
    setStartNode(newNode);
    return newGrid;
  };

  const getNewGridWithUpdatedEndNode = (grid, row, col) => {
    const newGrid = [...grid];
    const node = newGrid[row][col];
    const newNode = {
      ...node,
      isStart: false,
      isEnd: true,
    };
    const prevEndNode = endNode;
    if (prevEndNode !== null) {
      const prevEndNodeRow = prevEndNode.row;
      const prevEndNodeCol = prevEndNode.col;
      newGrid[prevEndNodeRow][prevEndNodeCol] = {
        ...prevEndNode,
        isEnd: false,
      };
    }
    newGrid[row][col] = newNode;
    setEndNode(newNode);
    return newGrid;
  };

  // Visualization
  const visualizeAlgorithm = () => {
    if (isVisualizingRef.current) return;
    if (!startNode || !endNode) {
      alert('Please select both start and end nodes.');
      return;
    }

    isVisualizingRef.current = true;
    const visitedNodesInOrder = dijkstra(grid, startNode, endNode);
    const shortestPath = getShortestPath(endNode);
    animateAlgorithm(visitedNodesInOrder, shortestPath);
  };

  // Dijkstra
  const dijkstra = (grid, startNode, endNode) => {
    const visitedNodes = [];
    startNode.distance = 0;
    const unvisitedNodes = getAllNodes(grid);

    while (unvisitedNodes.length) {
      sortNodesByDistance(unvisitedNodes);
      const closestNode = unvisitedNodes.shift();

      if (closestNode.isWall) continue;
      if (closestNode.distance === Infinity) return visitedNodes;

      closestNode.isVisited = true;
      visitedNodes.push(closestNode);

      if (closestNode === endNode) return visitedNodes;

      updateUnvisitedNeighbors(closestNode, grid);
    }
  };


  const getAllNodes = (grid) => {
    const nodes = [];
    for (const row of grid) {
      for (const node of row) {
        nodes.push(node);
      }
    }
    return nodes;
  };

  const sortNodesByDistance = (unvisitedNodes) => {
    unvisitedNodes.sort((nodeA, nodeB) => nodeA.distance - nodeB.distance);
  };

  //Update distances
  const updateUnvisitedNeighbors = (node, grid) => {
    const neighbors = getNeighbors(node, grid);
    for (const neighbor of neighbors) {
      neighbor.distance = node.distance + 1;
      neighbor.previousNode = node;
    }
  };

  //neighbors
  const getNeighbors = (node, grid) => {
    const { col, row } = node;
    const neighbors = [];
    if (row > 0) neighbors.push(grid[row - 1][col]);
    if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
    if (col > 0) neighbors.push(grid[row][col - 1]);
    if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
    return neighbors.filter((neighbor) => !neighbor.isVisited);
  };

  //shortest path from start to end node
  const getShortestPath = (endNode) => {
    const shortestPath = [];
    let currentNode = endNode;
    while (currentNode !== null) {
      shortestPath.unshift(currentNode);
      currentNode = currentNode.previousNode;
    }
    return shortestPath;
  };

  //Animation
  const animateAlgorithm = (visitedNodesInOrder, shortestPath) => {
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          animateShortestPath(shortestPath);
        }, 10 * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          'node node-visited';
      }, 10 * i);
    }
  };

  const animateShortestPath = (shortestPath) => {
    for (let i = 0; i < shortestPath.length; i++) {
      setTimeout(() => {
        const node = shortestPath[i];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          'node node-shortest-path';
      }, 50 * i);
    }
    isVisualizingRef.current = false;
  };

  // Clear the grid
  /* const clearGrid = () => {
    if (isVisualizingRef.current) return;
    const newGrid = grid.map((row) =>
      row.map((node) => ({
        ...node,
        distance: Infinity,
        isVisited: false,
        previousNode: null,
        isShortestPath: false,
        isStart: false, // Reset isStart flag
        isEnd: false, // Reset isEnd flag
      }))
    );
    setGrid(newGrid);
    setStartNode(null); // Reset start node
    setEndNode(null); // Reset end node
  }; */

  return (
    <div className="visualizer">
      <h1>Dijkstra's Shortest Path</h1> 
      <div className="button-container">
        <button
          className="visualizer-button"
          onClick={() => setMouseIsPressed('start')}
        >
          Select Start Node
        </button>
        <button
          className="visualizer-button"
          onClick={() => setMouseIsPressed('end')}
        >
          Select End Node
        </button>
        <button
          className="visualizer-button"
          onClick={() => setMouseIsPressed('wall')}
        >
          Add Walls
        </button>
        <button className="visualizer-button" onClick={visualizeAlgorithm}>
          Visualize Algorithm
        </button>
      </div>
      <div className="grid">
        {grid.map((row, rowIndex) => {
          return (
            <div key={rowIndex} className="row">
              {row.map((node, nodeIndex) => {
                const { col, row, isStart, isEnd, isWall } = node;
                return (
                  <Node
                    key={nodeIndex}
                    col={col}
                    row={row}
                    isStart={isStart}
                    isEnd={isEnd}
                    isWall={isWall}
                    mouseIsPressed={mouseIsPressed}
                    onMouseDown={(row, col) => handleMouseDown(row, col)}
                    onMouseEnter={(row, col) => handleMouseEnter(row, col)}
                    onMouseUp={() => handleMouseUp()}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
      <div className="name">
        <p>- Ishita Saraswat</p>
      </div>
    </div>
  );
};

export default Visualizer;
