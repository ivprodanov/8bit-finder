import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NeuralRecall() {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [gameState, setGameState] = useState('menu'); // menu, flashing, input, gameOver
  const [level, setLevel] = useState(3); // Number of digits
  const [targetNumber, setTargetNumber] = useState("");
  const [userInput, setUserInput] = useState("");
  const [flashTimer, setFlashTimer] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('recall-high-score');
    return saved ? parseInt(saved, 10) : 0;
  });

  // --- GAME LOGIC ---
  const startRound = (currentLevel) => {
    // Generate random number of length 'currentLevel'
    let num = "";
    for (let i = 0; i < currentLevel; i++) {
      num += Math.floor(Math.random() * 10).toString();
    }
    setTargetNumber(num);
    setUserInput("");
    setGameState('flashing');
    setFlashTimer(2000); // 2 seconds to memorize
  };

  useEffect(() => {
    let timer;
    if (gameState === 'flashing' && flashTimer > 0) {
      timer = setTimeout(() => {
        setFlashTimer(0);
        setGameState('input');
        // Small delay to ensure input is rendered before focusing
        setTimeout(() => inputRef.current?.focus(), 50);
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [gameState, flashTimer]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userInput === targetNumber) {
      const nextLevel = level + 1;
      setLevel(nextLevel);
      // Brief "Success" pause before next round
      setGameState('success');
      setTimeout(() => startRound(nextLevel), 1000);
    } else {
      handleGameOver();
    }
  };

  const handleGameOver = () => {
    setGameState('gameOver');
    const finalScore = level - 3; // Score is based on how many levels passed
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('recall-high-score', finalScore.toString());
    }
  };

  const startGame = () => {
    setLevel(3);
    setGameState('flashing');
    startRound(3);
  };

  return (
    <div className="min-h-screen bg-slate-900 font-['Press_Start_2P',_monospace] text-white flex flex-col items-center py-10 px-4">
      
      {/* HUD */}
      <div className="w-full max-w-2xl flex justify-between items-center bg-slate-800 p-5 border-4 border-slate-950 shadow-[8px_8px_0px_rgba(0,0,0,0.6)] mb-8">
        <div>
          <div className="text-[10px] text-slate-400 mb-1">BEST STREAK: {highScore}</div>
          <div className="text-xl text-cyan-400">DIGITS: {level}</div>
        </div>
        <div className="text-right text-[10px] text-slate-500">
          LEVEL: {level - 2}
        </div>
      </div>

      {/* GAME CONSOLE */}
      <div className="w-full max-w-2xl bg-black border-8 border-slate-700 shadow-[12px_12px_0px_rgba(0,0,0,1)] p-12 text-center min-h-[300px] flex flex-col items-center justify-center relative">
        
        {gameState === 'menu' && (
          <>
            <h2 className="text-2xl text-yellow-400 mb-6">NEURAL RECALL</h2>
            <p className="text-[10px] leading-loose mb-10 text-slate-400">Memorize the sequence.<br/>Enter it exactly as shown.</p>
            <button onClick={startGame} className="px-8 py-4 bg-cyan-600 text-white border-4 border-white shadow-[4px_4px_0px_rgba(255,255,255,0.2)] active:translate-y-1 active:shadow-none">
              INITIALIZE
            </button>
          </>
        )}

        {gameState === 'flashing' && (
          <div className="animate-pulse">
            <div className="text-[10px] text-cyan-500 mb-4 tracking-widest">MEMORIZE:</div>
            <div className="text-4xl md:text-6xl text-white tracking-widest">
              {targetNumber}
            </div>
          </div>
        )}

        {gameState === 'input' && (
          <form onSubmit={handleSubmit} className="w-full">
            <div className="text-[10px] text-yellow-500 mb-6 uppercase">Recall Sequence:</div>
            <input 
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value.replace(/\D/g, ""))}
              className="w-full max-w-md bg-slate-900 border-b-4 border-cyan-500 p-4 text-center text-3xl focus:outline-none text-white tracking-[0.5em]"
              placeholder="???"
              autoFocus
            />
            <button type="submit" className="mt-8 text-[10px] text-slate-600 hover:text-white transition-colors">
              [ PRESS ENTER ]
            </button>
          </form>
        )}

        {gameState === 'success' && (
          <div className="text-green-400 text-2xl animate-ping">
            CORRECT!
          </div>
        )}

        {gameState === 'gameOver' && (
          <>
            <h2 className="text-3xl text-red-600 mb-4">SYSTEM CRASH</h2>
            <p className="text-xs text-slate-400 mb-2 uppercase">Sequence Mismatch</p>
            <p className="text-sm mb-10 text-white">Expected: {targetNumber}</p>
            
            <div className="flex gap-4">
              <button onClick={startGame} className="px-6 py-4 bg-cyan-600 text-white border-4 border-black active:translate-y-1">RETRY</button>
              <button onClick={() => navigate('/')} className="px-6 py-4 bg-slate-700 text-white border-4 border-black active:translate-y-1">MENU</button>
            </div>
          </>
        )}
      </div>

      <div className="mt-12 flex gap-8">
         <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse" />
            <span className="text-[10px] text-slate-500 uppercase">Neural Link Active</span>
         </div>
      </div>
    </div>
  );
}
