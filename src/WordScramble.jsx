import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const WORD_LIST = [
  "PIXEL", "ARCADE", "TRAIN", "SNAKE", "VOXEL", 
  "SWORD", "POTION", "GUILD", "QUEST", "DRAGON",
  "WIZARD", "SHIELD", "DUNGEON", "MONSTER", "RAILWAY"
];

export default function WordScramble() {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [gameState, setGameState] = useState('menu'); // menu, playing, gameOver
  const [currentWord, setCurrentWord] = useState("");
  const [scrambledWord, setScrambledWord] = useState("");
  const [userInput, setUserInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('scramble-high-score');
    return saved ? parseInt(saved, 10) : 0;
  });

  // --- LOGIC: Scramble a word ---
  const scramble = (word) => {
    let scrambled = word.split('').sort(() => Math.random() - 0.5).join('');
    // Ensure it's actually different from the original
    if (scrambled === word) return scramble(word);
    return scrambled;
  };

  const nextWord = () => {
    const word = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
    setCurrentWord(word);
    setScrambledWord(scramble(word));
    setUserInput("");
  };

  // --- TIMER ---
  useEffect(() => {
    if (gameState !== 'playing' || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleGameOver();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameState('playing');
    nextWord();
    // Focus input after state update
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleGameOver = () => {
    setGameState('gameOver');
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('scramble-high-score', score.toString());
    }
  };

  const checkWord = (e) => {
    e.preventDefault();
    if (userInput.toUpperCase() === currentWord) {
      setScore(prev => prev + 100);
      setTimeLeft(prev => prev + 5); // Time Bonus!
      nextWord();
    } else {
      // Small penalty for wrong guess
      setTimeLeft(prev => Math.max(0, prev - 2));
      setUserInput("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 font-['Press_Start_2P',_monospace] text-white flex flex-col items-center py-10 px-4">
      
      {/* HUD */}
      <div className="w-full max-w-2xl flex justify-between items-center bg-slate-800 p-5 border-4 border-slate-950 shadow-[8px_8px_0px_rgba(0,0,0,0.6)] mb-8">
        <div>
          <div className="text-[10px] text-slate-400 mb-1">HI-SCORE: {highScore}</div>
          <div className="text-xl text-green-400">SCORE: {score}</div>
        </div>
        <div className={`text-2xl ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-yellow-400'}`}>
          {timeLeft}s
        </div>
      </div>

      {/* GAME BOARD */}
      <div className="w-full max-w-2xl bg-blue-900 border-8 border-white shadow-[12px_12px_0px_rgba(0,0,0,1)] p-10 text-center relative">
        
        {gameState === 'menu' && (
          <>
            <h2 className="text-2xl text-yellow-400 mb-6">WORD SCRAMBLE</h2>
            <p className="text-xs leading-loose mb-10 text-slate-200">Unscramble the 8-bit words!<br/>Correct answers give +5s bonus.</p>
            <button onClick={startGame} className="px-8 py-4 bg-yellow-400 text-black border-4 border-black shadow-[4px_4px_0px_white] active:translate-y-1 active:shadow-none transition-all">
              START
            </button>
          </>
        )}

        {gameState === 'playing' && (
          <>
            <div className="mb-4 text-xs text-cyan-300 tracking-widest">UNSCRAMBLE THIS:</div>
            <div className="text-3xl md:text-5xl mb-12 tracking-[0.2em] text-white drop-shadow-md uppercase">
              {scrambledWord}
            </div>

            <form onSubmit={checkWord} className="flex flex-col items-center">
              <input 
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="w-full bg-black border-4 border-white p-4 text-center text-xl mb-6 focus:outline-none focus:border-yellow-400 text-yellow-400 uppercase"
                placeholder="TYPE HERE..."
                autoFocus
              />
              <button type="submit" className="text-xs hover:text-yellow-400 transition-colors">
                [ PRESS ENTER TO SUBMIT ]
              </button>
            </form>
          </>
        )}

        {gameState === 'gameOver' && (
          <>
            <h2 className="text-3xl text-red-500 mb-6">TIME'S UP!</h2>
            <p className="text-xl mb-8">SCORE: {score}</p>
            {score >= highScore && score > 0 && <p className="text-yellow-400 animate-bounce mb-8">NEW HIGH SCORE!</p>}
            <div className="flex gap-4 justify-center">
              <button onClick={startGame} className="px-6 py-4 bg-green-500 text-black border-4 border-black shadow-[4px_4px_0px_white] active:translate-y-1">RETRY</button>
              <button onClick={() => navigate('/')} className="px-6 py-4 bg-slate-500 text-black border-4 border-black shadow-[4px_4px_0px_white] active:translate-y-1">MENU</button>
            </div>
          </>
        )}
      </div>

    </div>
  );
}