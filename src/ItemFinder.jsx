import React, { useState, useEffect } from 'react';
import { LEVELS } from './data'; 
import { useNavigate } from 'react-router-dom';

export default function ItemFinderGame() {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0); 
  const [gameState, setGameState] = useState('menu'); 
  const [timeLeft, setTimeLeft] = useState(0);
  const [foundItems, setFoundItems] = useState([]);
  const navigate = useNavigate();

  // --- NEW: Load High Score on mount ---
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('item-high-score');
    return saved ? parseInt(saved, 10) : 0;
  });

  const currentLevel = LEVELS[currentLevelIndex];
  const hasNextLevel = currentLevelIndex < LEVELS.length - 1;

  const logCoordinates = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    console.log(`left: ${x.toFixed(2)}%, top: ${y.toFixed(2)}%`);
  };

  useEffect(() => {
    if (gameState !== 'playing' || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  useEffect(() => {
    if (gameState === 'playing') {
      if (foundItems.length === currentLevel.itemsToFind.length) {
        setGameState('won');
        
        // --- NEW: High Score Logic ---
        // Only check for high score if they beat the VERY LAST level
        if (!hasNextLevel) {
          // You could calculate score based on total time left, or items found. 
          // Let's say score = timeLeft * 10 + (total items * 100)
          const finalScore = (timeLeft * 10) + (currentLevel.itemsToFind.length * 100);
          
          if (finalScore > highScore) {
            setHighScore(finalScore);
            localStorage.setItem('item-high-score', finalScore.toString());
          }
        }

      } else if (timeLeft === 0) {
        setGameState('lost');
      }
    }
  }, [foundItems, timeLeft, gameState, currentLevel, hasNextLevel, highScore]);

  const startGame = () => {
    setFoundItems([]);
    setTimeLeft(currentLevel.timeLimit);
    setGameState('playing');
  };

  const goToNextLevel = () => {
    setCurrentLevelIndex(prev => prev + 1);
    setGameState('menu'); 
  };

  const restartEntireGame = () => {
    setCurrentLevelIndex(0);
    setGameState('menu');
  };

  const handleItemClick = (id) => {
    if (gameState !== 'playing') return;
    if (!foundItems.includes(id)) {
      setFoundItems(prev => [...prev, id]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 font-['Press_Start_2P',_monospace] text-white flex flex-col items-center pb-20 pt-8 px-4">
      
      {/* --- HUD --- */}
      <div className="w-full max-w-5xl p-5 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-800 border-4 border-slate-950 shadow-[8px_8px_0px_rgba(0,0,0,0.6)] rounded-sm">
        
        <div className="flex flex-col gap-2">
          <button onClick={() => navigate('/')} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 border-2 border-slate-950 text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all">
            QUIT TO MENU
          </button>
          {/* --- NEW: Display High Score on HUD --- */}
          <span className="text-xs text-yellow-400">HI-SCORE: {highScore}</span>
        </div>

        <div className="text-center md:text-left">
          <h1 className="text-sm md:text-base text-yellow-400 mb-2 tracking-widest leading-loose">
            {currentLevel.name}
          </h1>
          <p className="text-xs text-slate-300">Found: {foundItems.length}/{currentLevel.itemsToFind.length}</p>
        </div>
        
        <div className="flex gap-3">
          {currentLevel.itemsToFind.map(item => {
            const isFound = foundItems.includes(item.id);
            return (
              <div 
                key={item.id} 
                className={`w-14 h-14 bg-slate-700 border-4 rounded-sm flex items-center justify-center transition-all ${isFound ? 'border-green-500 opacity-40 grayscale' : 'border-slate-900 shadow-[4px_4px_0px_rgba(0,0,0,0.4)]'}`}
                title={item.name}
              >
                {item.icon ? (
                  <img src={item.icon} alt={item.name} className="w-full h-full object-contain p-1" />
                ) : (
                  <span className="text-xs text-slate-400">?</span>
                )}
              </div>
            );
          })}
        </div>

        <div className={`text-xl md:text-2xl px-4 py-3 rounded-sm border-4 ${timeLeft <= 10 ? 'text-red-400 border-red-500 animate-pulse' : 'text-green-400 border-slate-900 bg-slate-900 shadow-[4px_4px_0px_rgba(0,0,0,0.4)]'}`}>
          {timeLeft}s
        </div>
      </div>

      {/* --- GAME BOARD --- */}
      <div className="relative w-full max-w-5xl mt-6 border-8 border-slate-950 shadow-[12px_12px_0px_rgba(0,0,0,0.6)] rounded-sm overflow-hidden select-none bg-black">
        
        <img 
          onClick={logCoordinates}
          src={currentLevel.backgroundImage} 
          alt="Level Background" 
          className={`w-full h-auto block transition-all duration-300 ${gameState !== 'playing' ? 'blur-sm brightness-50' : ''}`}
          draggable="false"
        />

        {gameState === 'playing' && currentLevel.itemsToFind.map(item => {
          const isFound = foundItems.includes(item.id);
          return (
            <div
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`absolute cursor-pointer transition-all ${isFound ? 'ring-4 ring-green-400 bg-green-400/40 animate-pulse' : 'hover:bg-white/10'}`}
              style={{
                top: `${item.hitbox.top}%`,
                left: `${item.hitbox.left}%`,
                width: `${item.hitbox.width}%`,
                height: `${item.hitbox.height}%`,
                pointerEvents: isFound ? 'none' : 'auto'
              }}
            />
          );
        })}

        {/* --- MODALS --- */}
        {gameState !== 'playing' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-50">
            <div className="bg-blue-900 p-8 text-center border-4 border-white shadow-[12px_12px_0px_rgba(0,0,0,1)] max-w-lg w-full mx-4">
              
              {gameState === 'menu' && (
                <>
                  <h2 className="text-xl md:text-2xl text-yellow-400 mb-6 leading-loose">Level {currentLevelIndex + 1}</h2>
                  <p className="text-xs md:text-sm text-slate-200 mb-10 leading-loose">Find all the hidden items before the clock runs out.</p>
                  <button onClick={startGame} className="px-6 py-4 bg-yellow-400 hover:bg-yellow-300 text-slate-900 text-xs md:text-sm uppercase border-4 border-slate-900 shadow-[6px_6px_0px_rgba(0,0,0,1)] active:shadow-[0px_0px_0px_rgba(0,0,0,1)] active:translate-y-[6px] active:translate-x-[6px] transition-all">
                    START GAME
                  </button>
                </>
              )}

              {gameState === 'won' && (
                <>
                  <h2 className="text-xl md:text-3xl text-green-400 mb-6 animate-bounce">
                    {hasNextLevel ? 'LEVEL CLEARED!' : 'GAME BEATEN!'}
                  </h2>
                  <p className="text-xs md:text-sm text-slate-200 mb-10 leading-loose">
                    {hasNextLevel ? `Great job! Ready for Level ${currentLevelIndex + 2}?` : `You found every hidden item. Final Score: ${(timeLeft * 10) + (currentLevel.itemsToFind.length * 100)}`}
                  </p>
                  
                  {hasNextLevel ? (
                    <button onClick={goToNextLevel} className="px-6 py-4 bg-green-400 hover:bg-green-300 text-slate-900 text-xs md:text-sm uppercase border-4 border-slate-900 shadow-[6px_6px_0px_rgba(0,0,0,1)] active:shadow-[0px_0px_0px_rgba(0,0,0,1)] active:translate-y-[6px] active:translate-x-[6px] transition-all">
                      NEXT LEVEL
                    </button>
                  ) : (
                    <button onClick={restartEntireGame} className="px-6 py-4 bg-yellow-400 hover:bg-yellow-300 text-slate-900 text-xs md:text-sm uppercase border-4 border-slate-900 shadow-[6px_6px_0px_rgba(0,0,0,1)] active:shadow-[0px_0px_0px_rgba(0,0,0,1)] active:translate-y-[6px] active:translate-x-[6px] transition-all">
                      PLAY FROM START
                    </button>
                  )}
                </>
              )}

              {gameState === 'lost' && (
                <>
                  <h2 className="text-xl md:text-3xl text-red-500 mb-10">TIME'S UP!</h2>
                  <button onClick={startGame} className="px-6 py-4 bg-yellow-400 hover:bg-yellow-300 text-slate-900 text-xs md:text-sm uppercase border-4 border-slate-900 shadow-[6px_6px_0px_rgba(0,0,0,1)] active:shadow-[0px_0px_0px_rgba(0,0,0,1)] active:translate-y-[6px] active:translate-x-[6px] transition-all">
                    TRY AGAIN
                  </button>
                </>
              )}
              
            </div>
          </div>
        )}
      </div>
    </div>
  );
}