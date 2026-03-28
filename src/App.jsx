import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import our pages
import Home from './pages/Home';
import ItemFinderGame from './ItemFinder';
import TrainGame from './TrainGame';
import SnakeGame from './SnakeGame';
import SpaceInvadersGame from './SpaceInvadersGame';
import WordScramble from './WordScramble';
import WhackAMole from './WhackAMole';
import NeuralRecall from './NeuralRecall';
import HangmanGame from './HangmanGame';

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
      <Route path="/scramble" element={<WordScramble />} />
      <Route path="/whack" element={<WhackAMole />} />
      <Route path="/recall" element={<NeuralRecall />} />
      <Route path="/hangman" element={<HangmanGame />} />
    </Routes>
  );
}