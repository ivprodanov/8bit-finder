import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  // --- NEW: State to hold our high scores ---
  const [scores, setScores] = useState({
  'item-finder': 0, 'train-game': 0, 'snake-game': 0, 'invaders': 0, 'scramble': 0, 'whack-game': 0,'recall-game': 0
});

  // --- NEW: Fetch scores from localStorage when the menu loads ---
  useEffect(() => {
    setScores({
      // Make sure these string keys match exactly what you use in your game files!
      'item-finder': parseInt(localStorage.getItem('item-high-score') || '0', 10),
      'train-game': parseInt(localStorage.getItem('train-high-score') || '0', 10),
      'snake-game': parseInt(localStorage.getItem('snake-high-score') || '0', 10),
      'invaders': parseInt(localStorage.getItem('invaders-high-score') || '0', 10),
      'scramble': parseInt(localStorage.getItem('scramble-high-score') || '0', 10),
      'whack-game': parseInt(localStorage.getItem('whack-high-score') || '0', 10),
      'recall-game': parseInt(localStorage.getItem('recall-high-score') || '0', 10)
    });
  }, []);

  const games = [
    {
      id: 'item-finder',
      title: 'Voxel Finder',
      description: 'Find the hidden 8-bit items before time runs out!',
      path: '/item-finder',
      color: 'bg-indigo-600',
      hoverColor: 'hover:bg-indigo-500',
    },
    {
      id: 'train-game',
      title: 'Rail Dodger',
      description: 'Dodge rocks and oncoming trains in this high-speed survival game!',
      path: '/train-game',
      color: 'bg-red-600',
      hoverColor: 'hover:bg-red-500',
    },
    {
      id: 'snake-game',
      title: 'Retro Snake',
      description: 'Navigate the grid and eat apples to grow. Don\'t bite your own tail!',
      path: '/snake-game',
      color: 'bg-green-600',
      hoverColor: 'hover:bg-green-500',
    },
    {
  id: 'invaders',
  title: 'Pixel Invaders',
  description: 'Blast the alien swarm before they breach your defenses!',
  path: '/invaders',
  color: 'bg-blue-600',
  hoverColor: 'hover:bg-blue-500',
},
{
  id: 'scramble',
  title: 'Word Scramble',
  description: 'Unscramble retro terms under pressure. Fast typing wins!',
  path: '/scramble',
  color: 'bg-pink-600',
  hoverColor: 'hover:bg-pink-500',
},
{
  id: 'whack-game',
  title: 'Pixel Puncher',
  description: 'A classic test of reflexes. Whack the monsters before they hide!',
  path: '/whack',
  color: 'bg-orange-600',
  hoverColor: 'hover:bg-orange-500',
},
{
  id: 'recall-game',
  title: 'Neural Recall',
  description: 'Test your photographic memory. How many digits can you hold?',
  path: '/recall',
  color: 'bg-cyan-700',
  hoverColor: 'hover:bg-cyan-600',
}
  ];

  // --- Optional: A function to clear all scores ---
  const clearScores = () => {
    if (window.confirm("Are you sure you want to erase all high scores?")) {
      localStorage.clear();
      setScores({ 'item-finder': 0, 'train-game': 0, 'snake-game': 0 });
    }
  };

  return (
    <div className="min-h-screen bg-black font-['Press_Start_2P',_monospace] text-white flex flex-col items-center py-20 px-4 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
      
      {/* Arcade Header */}
      <div className="text-center mb-16 animate-pulse relative">
        <h1 className="text-3xl md:text-5xl text-yellow-400 mb-4 tracking-widest drop-shadow-[4px_4px_0px_rgba(255,0,0,0.8)]">
          RETRO ARCADE
        </h1>
        <p className="text-sm text-cyan-400">INSERT COIN TO PLAY</p>
      </div>

      {/* Game Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {games.map((game) => (
          <Link 
            key={game.id} 
            to={game.path}
            className={`flex flex-col p-6 border-4 border-white shadow-[8px_8px_0px_rgba(255,255,255,0.2)] ${game.color} ${game.hoverColor} transition-all active:translate-y-[4px] active:translate-x-[4px] active:shadow-[0px_0px_0px_rgba(255,255,255,0.2)] group cursor-pointer`}
          >
            <h2 className="text-xl text-yellow-300 mb-4 group-hover:animate-bounce">{game.title}</h2>
            <p className="text-xs leading-loose text-slate-100 flex-grow">{game.description}</p>
            
            {/* --- NEW: High Score Display at the bottom of the card --- */}
            <div className="mt-8 flex justify-between items-end border-t-2 border-white/20 pt-4">
              <div className="text-xs text-yellow-300">
                HI-SCORE: <span className="text-white">{scores[game.id]}</span>
              </div>
              <div className="text-xs text-white opacity-50 group-hover:opacity-100">
                PLAY NOW {'>'}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* --- NEW: Reset Scores Button --- */}
      <button 
        onClick={clearScores}
        className="mt-16 text-[10px] text-slate-500 hover:text-red-400 transition-colors"
      >
        [ RESET ALL SCORES ]
      </button>

    </div>
  );
}