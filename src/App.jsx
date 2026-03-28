import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import our pages
import Home from './pages/Home';
import ItemFinderGame from './ItemFinder';
import TrainGame from './TrainGame';
import SnakeGame from './SnakeGame';
import SpaceInvadersGame from './SpaceInvadersGame';

export default function App() {
  return (
    <Routes>
      {/* The main menu sits at the root URL (/) */}
      <Route path="/" element={<Home />} />
      
      {/* The game sits at /item-finder */}
      <Route path="/item-finder" element={<ItemFinderGame />} />
      <Route path="/train-game" element={<TrainGame />} />
      <Route path="/snake-game" element={<SnakeGame />} />
      <Route path="/invaders" element={<SpaceInvadersGame />} />
    </Routes>
  );
}