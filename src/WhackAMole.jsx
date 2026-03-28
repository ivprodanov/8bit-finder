import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function WhackAMole() {
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameState, setGameState] = useState('menu'); // menu, playing, gameOver
  const [activeHole, setActiveHole] = useState(null);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('whack-high-score');
    return saved ? parseInt(saved, 10) : 0;
  });

  const timerRef = useRef(null);
  const moleTimeoutRef = useRef(null);

  // --- GAME LOGIC ---
  const spawnMole = () => {
    if (gameState !== 'playing') return;

    // Pick a random hole (0-8) that isn't the current one
    let newHole;
    do {
      newHole = Math.floor(Math.random() * 9);
    } while (newHole === activeHole);

    setActiveHole(newHole);

    // Moles stay up shorter as score increases
    const difficulty = Math.max(400, 1000 - (score * 2));
    
    moleTimeoutRef.current = setTimeout(() => {
      setActiveHole(null);
      // Wait a tiny bit before spawning the next one
      setTimeout(spawnMole, Math.random() * 500 + 200);
    }, difficulty);
  };

  const handleWhack = (index) => {
    if (index === activeHole && gameState === 'playing') {
      setScore(prev => prev + 10);
      setActiveHole(null);
      clearTimeout(moleTimeoutRef.current);
      spawnMole(); // Spawn next one immediately on success
    }
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameState('playing');
  };

  const handleGameOver = () => {
    setGameState('gameOver');
    setActiveHole(null);
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('whack-high-score', score.toString());
    }
  };

  // Timer Effect
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleGameOver();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [gameState, timeLeft]);

  // Initial Spawn Effect
  useEffect(() => {
    if (gameState === 'playing') {
      spawnMole();
    }
    return () => clearTimeout(moleTimeoutRef.current);
  }, [gameState]);

  return (
    <div className="min-h-screen bg-slate-900 font-['Press_Start_2P',_monospace] text-white flex flex-col items-center py-10 px-4">
      
      {/* HUD */}
      <div className="w-full max-w-xl flex justify-between items-center bg-slate-800 p-5 border-4 border-slate-950 shadow-[8px_8px_0px_rgba(0,0,0,0.6)] mb-8">
        <div>
          <div className="text-[10px] text-slate-400 mb-1">HI-SCORE: {highScore}</div>
          <div className="text-xl text-yellow-400">SCORE: {score}</div>
        </div>
        <div className={`text-2xl ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
          {timeLeft}s
        </div>
      </div>

      {/* GAME GRID */}
      <div className="relative w-full max-w-md aspect-square grid grid-cols-3 gap-4 bg-green-800 p-4 border-8 border-slate-950 shadow-[12px_12px_0px_rgba(0,0,0,0.5)]">
        {[...Array(9)].map((_, i) => (
          <div 
            key={i} 
            onClick={() => handleWhack(i)}
            className="relative bg-green-950 border-4 border-green-900 rounded-full overflow-hidden cursor-crosshair active:bg-green-900 transition-colors"
          >
            {/* The Hole Shadow */}
            <div className="absolute inset-x-2 bottom-2 h-4 bg-black/40 rounded-full" />
            
            {/* The Mole */}
            <div className={`absolute inset-x-0 bottom-0 flex justify-center transition-transform duration-100 ease-out ${activeHole === i ? 'translate-y-0' : 'translate-y-full'}`}>
              {/* Simple 8-bit Mole using Tailwind */}
              <div className="w-12 h-16 bg-amber-800 rounded-t-full border-x-4 border-t-4 border-black relative">
                <div className="absolute top-4 left-2 w-2 h-2 bg-black" />
                <div className="absolute top-4 right-2 w-2 h-2 bg-black" />
                <div className="absolute top-7 left-4 w-4 h-2 bg-pink-300 rounded-full" />
              </div>
            </div>
          </div>
        ))}

        {/* Overlays */}
        {gameState !== 'playing' && (
          <div className="absolute inset-0 z-10 bg-black/70 flex flex-col items-center justify-center p-6 text-center">
            {gameState === 'menu' ? (
              <>
                <h2 className="text-xl text-yellow-400 mb-6">PIXEL PUNCHER</h2>
                <button onClick={startGame} className="px-6 py-4 bg-yellow-400 text-black border-4 border-black shadow-[4px_4px_0px_white] active:translate-y-1">START</button>
              </>
            ) : (
              <>
                <h2 className="text-2xl text-red-500 mb-4">GAME OVER</h2>
                <p className="mb-8">FINAL SCORE: {score}</p>
                <div className="flex gap-4">
                  <button onClick={startGame} className="px-4 py-3 bg-green-500 text-black text-xs border-4 border-black active:translate-y-1">RETRY</button>
                  <button onClick={() => navigate('/')} className="px-4 py-3 bg-slate-500 text-black text-xs border-4 border-black active:translate-y-1">MENU</button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <p className="mt-8 text-[10px] text-slate-500 italic">Whack them as fast as you can!</p>
    </div>
  );
}