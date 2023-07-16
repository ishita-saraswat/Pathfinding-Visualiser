import React, { useState, useEffect, useRef, useCallback } from 'react';
import Node from './Node';
import './Visualizer.css';

const Visualizer = () => {
  const [grid, setGrid] = useState([]);
  const [mouseIsPressed, setMouseIsPressed] = useState(false);
  const [startNode, setStartNode] = useState(null);
  const [endNode, setEndNode] = useState(null);
  const isVisualizingRef = useRef(false);
  const [timeTaken, setTimeTaken] = useState(0);

  const initializeGrid = useCallback(() => {
    const initialGrid = [];
    for (let row = 0; row < 50; row++) {
      const currentRow = [];
      for (let col = 0; col < 50; col++) {
        currentRow.push(createNode(col, row));
      }
      initialGrid.push(currentRow);
    }
    setGrid(initialGrid);
  }, []);

  useEffect(() => {
    initializeGrid();
  }, [initializeGrid]);

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

  const handleMouseUp = () => {
    if (isVisualizingRef.current) return;
    setMouseIsPressed(false);
  };

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

    if (mouseIsPressed === 'start') {
      const newGrid = getNewGridWithUpdatedStartNode(grid, row, col);
      setGrid(newGrid);
    } else if (mouseIsPressed === 'end') {
      const newGrid = getNewGridWithUpdatedEndNode(grid, row, col);
      setGrid(newGrid);
    } else {
      const newGrid = getNewGridWithUpdatedNode(grid, row, col);
      setGrid(newGrid);
    }
  };

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

  const getNewGridWithUpdatedNode = (grid, row, col) => {
    const newGrid = [...grid];
    const node = newGrid[row][col];
    let newNode;

    if (mouseIsPressed === 'wall') {
      newNode = {
        ...node,
        isWall: !node.isWall,
      };
      newGrid[row][col] = newNode;
    } else {
      // Handle other cases here if needed
    }

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

  const visualizeAlgorithm = (algorithm) => {
    if (isVisualizingRef.current) return;
    if (!startNode || !endNode) {
      alert('Please select both start and end nodes.');
      return;
    }

    isVisualizingRef.current = true;
    let visitedNodesInOrder = [];
    let shortestPath = [];

    if (algorithm === 'dijkstra') {
      visitedNodesInOrder = dijkstra(grid, startNode, endNode);
      shortestPath = getShortestPath(endNode);
    } else if (algorithm === 'astar') {
      visitedNodesInOrder = astar(grid, startNode, endNode);
      shortestPath = getShortestPath(endNode);
    } else if (algorithm === 'bfs') {
      visitedNodesInOrder = bfs(grid, startNode, endNode);
      shortestPath = getShortestPath(endNode);
    } else if (algorithm === 'dfs') {
      visitedNodesInOrder = dfs(grid, startNode, endNode);
      shortestPath = getShortestPath(endNode);
    }

    animateAlgorithm(visitedNodesInOrder, shortestPath);
  };

  const dijkstra = (grid, startNode, endNode) => {
    const visitedNodesInOrder = [];
    startNode.distance = 0;
    const unvisitedNodes = getAllNodes(grid);

    while (unvisitedNodes.length) {
      sortNodesByDistance(unvisitedNodes);
      const closestNode = unvisitedNodes.shift();

      if (closestNode.isWall) continue;
      if (closestNode.distance === Infinity) break;

      closestNode.isVisited = true;
      visitedNodesInOrder.push(closestNode);

      if (closestNode === endNode) break;

      updateUnvisitedNeighbors(closestNode, grid);
    }

    return visitedNodesInOrder;
  };

  const astar = (grid, startNode, endNode) => {
    const visitedNodesInOrder = [];
    startNode.distance = 0;
    startNode.heuristic = calculateHeuristic(startNode, endNode);
    const unvisitedNodes = getAllNodes(grid);

    while (unvisitedNodes.length) {
      sortNodesByDistance(unvisitedNodes);
      const closestNode = unvisitedNodes.shift();

      if (closestNode.isWall) continue;
      if (closestNode.distance === Infinity) break;

      closestNode.isVisited = true;
      visitedNodesInOrder.push(closestNode);

      if (closestNode === endNode) break;

      updateAStarUnvisitedNeighbors(closestNode, endNode, grid, unvisitedNodes);
    }

    return visitedNodesInOrder;
  };

  const bfs = (grid, startNode, endNode) => {
    const visitedNodesInOrder = [];
    const queue = [];
    queue.push(startNode);

    while (queue.length) {
      const currentNode = queue.shift();

      if (currentNode.isWall) continue;
      if (currentNode.isVisited) continue;

      currentNode.isVisited = true;
      visitedNodesInOrder.push(currentNode);

      if (currentNode === endNode) break;

      const neighbors = getNeighbors(currentNode, grid);
      for (const neighbor of neighbors) {
        neighbor.previousNode = currentNode;
        queue.push(neighbor);
      }
    }

    return visitedNodesInOrder;
  };

  const dfs = (grid, startNode, endNode) => {
    const visitedNodesInOrder = [];
    const stack = [];
    stack.push(startNode);

    while (stack.length) {
      const currentNode = stack.pop();

      if (currentNode.isWall) continue;
      if (currentNode.isVisited) continue;

      currentNode.isVisited = true;
      visitedNodesInOrder.push(currentNode);

      if (currentNode === endNode) break;

      const neighbors = getNeighbors(currentNode, grid);
      for (const neighbor of neighbors) {
        neighbor.previousNode = currentNode;
        stack.push(neighbor);
      }
    }

    return visitedNodesInOrder;
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

  const sortNodesByHeuristic = (unvisitedNodes) => {
    unvisitedNodes.sort(
      (nodeA, nodeB) =>
        nodeA.distance + nodeA.heuristic - (nodeB.distance + nodeB.heuristic)
    );
  };

  const updateUnvisitedNeighbors = (node, grid) => {
    const neighbors = getNeighbors(node, grid);
    for (const neighbor of neighbors) {
      neighbor.distance = node.distance + 1;
      neighbor.previousNode = node;
    }
  };

  const updateAStarUnvisitedNeighbors = (node, endNode, grid, unvisitedNodes) => {
    const neighbors = getNeighbors(node, grid);
    for (const neighbor of neighbors) {
      const distanceToNeighbor = node.distance + 1;
      if (distanceToNeighbor < neighbor.distance) {
        neighbor.distance = distanceToNeighbor;
        neighbor.previousNode = node;
        neighbor.heuristic = calculateHeuristic(neighbor, endNode);
      }
    }
    sortNodesByHeuristic(unvisitedNodes);
  };

  const calculateHeuristic = (node, endNode) => {
    const dx = Math.abs(node.col - endNode.col);
    const dy = Math.abs(node.row - endNode.row);
    return dx + dy;
  };

  const getNeighbors = (node, grid) => {
    const { col, row } = node;
    const neighbors = [];
    if (row > 0) neighbors.push(grid[row - 1][col]);
    if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
    if (col > 0) neighbors.push(grid[row][col - 1]);
    if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
    return neighbors.filter((neighbor) => !neighbor.isVisited);
  };

  const getShortestPath = (endNode) => {
    const shortestPath = [];
    let currentNode = endNode;
    while (currentNode !== null) {
      shortestPath.unshift(currentNode);
      currentNode = currentNode.previousNode;
    }
    return shortestPath;
  };

  const animateAlgorithm = (visitedNodesInOrder, shortestPath) => {
    for (let i = 0; i < visitedNodesInOrder.length; i++) {
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          'node node-visited';
      }, 10 * i);
    }

    setTimeout(() => {
      animateShortestPath(shortestPath);
    }, 10 * visitedNodesInOrder.length);
  };

  const animateShortestPath = (shortestPath) => {
    for (let i = 0; i < shortestPath.length; i++) {
      setTimeout(() => {
        const node = shortestPath[i];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          'node node-shortest-path';
      }, 50 * i);
    }

    setTimeout(() => {
      isVisualizingRef.current = false;
      const timeElapsed = 50 * shortestPath.length;
      setTimeTaken(timeElapsed);
    }, 50 * shortestPath.length);
  };


  return (
    <div className="visualizer">
      <h1>Pathfinding Visualizer</h1>
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
        <button
          className="visualizer-button"
          onClick={() => visualizeAlgorithm('dijkstra')}
        >
          Dijkstra's Algorithm
        </button>
        <button
          className="visualizer-button"
          onClick={() => visualizeAlgorithm('astar')}
        >
          A* Search
        </button>
        <button
          className="visualizer-button"
          onClick={() => visualizeAlgorithm('bfs')}
        >
          Breadth-First Search
        </button>
        <button
          className="visualizer-button"
          onClick={() => visualizeAlgorithm('dfs')}
        >
          Depth-First Search
        </button>
      </div>
      <div className="time-taken">
        Time Taken: {timeTaken} ms
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
                    onMouseDown={() => handleMouseDown(row, col)}
                    onMouseEnter={() => handleMouseEnter(row, col)}
                    onMouseUp={handleMouseUp}
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
