import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const WORD_LIST = ["BITCOIN", "DISPLAY", "CONSOLE", "PROGRAM", "HACKER", "VIRTUAL", "NETWORK", "SPRITE", "PIXEL", "JOYSTICK", "RESTART", "LOADING"];

export default function HangmanGame() {
  const navigate = useNavigate();
  const [word, setWord] = useState("");
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const [gameState, setGameState] = useState('playing'); // playing, won, lost
  const maxMistakes = 6;

  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
    const newWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
    setWord(newWord);
    setGuessedLetters([]);
    setMistakes(0);
    setGameState('playing');
  };

  const handleGuess = (letter) => {
    if (gameState !== 'playing' || guessedLetters.includes(letter)) return;

    const newGuesses = [...guessedLetters, letter];
    setGuessedLetters(newGuesses);

    if (!word.includes(letter)) {
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);
      if (newMistakes >= maxMistakes) setGameState('lost');
    } else {
      // Check if all letters guessed
      const isWon = word.split('').every(char => newGuesses.includes(char));
      if (isWon) setGameState('won');
    }
  };

  // Render the 8-bit Hangman drawing
  const renderGallows = () => {
    return (
      <svg width="120" height="150" className="mx-auto mb-8">
        {/* Base and Post */}
        <line x1="10" y1="140" x2="110" y2="140" stroke="white" strokeWidth="4" />
        <line x1="30" y1="140" x2="30" y2="10" stroke="white" strokeWidth="4" />
        <line x1="30" y1="10" x2="80" y2="10" stroke="white" strokeWidth="4" />
        <line x1="80" y1="10" x2="80" y2="30" stroke="white" strokeWidth="4" />
        
        {/* Head */}
        {mistakes > 0 && <rect x="70" y="30" width="20" height="20" fill="none" stroke="#ef4444" strokeWidth="3" />}
        {/* Body */}
        {mistakes > 1 && <line x1="80" y1="50" x2="80" y2="90" stroke="#ef4444" strokeWidth="3" />}
        {/* Left Arm */}
        {mistakes > 2 && <line x1="80" y1="60" x2="60" y2="80" stroke="#ef4444" strokeWidth="3" />}
        {/* Right Arm */}
        {mistakes > 3 && <line x1="80" y1="60" x2="100" y2="80" stroke="#ef4444" strokeWidth="3" />}
        {/* Left Leg */}
        {mistakes > 4 && <line x1="80" y1="90" x2="60" y2="120" stroke="#ef4444" strokeWidth="3" />}
        {/* Right Leg */}
        {mistakes > 5 && <line x1="80" y1="90" x2="100" y2="120" stroke="#ef4444" strokeWidth="3" />}
      </svg>
    );
  };

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  return (
    <div className="min-h-screen bg-slate-900 font-['Press_Start_2P',_monospace] text-white flex flex-col items-center py-10 px-4">
      
      {/* HUD */}
      <div className="w-full max-w-2xl flex justify-between items-center bg-slate-800 p-5 border-4 border-slate-950 mb-8">
        <h1 className="text-sm text-yellow-400">GALLOWS PIXEL</h1>
        <button onClick={() => navigate('/')} className="text-[10px] bg-red-600 px-2 py-1 border-2 border-white">QUIT</button>
      </div>

      <div className="w-full max-w-2xl bg-black border-8 border-slate-700 p-8 text-center shadow-[12px_12px_0px_black]">
        
        {renderGallows()}

        {/* Word Display */}
        <div className="flex justify-center gap-2 mb-12">
          {word.split('').map((char, i) => (
            <div key={i} className="w-8 border-b-4 border-white text-xl md:text-2xl pb-1">
              {guessedLetters.includes(char) ? char : ""}
            </div>
          ))}
        </div>

        {/* Alphabet Grid */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {alphabet.map(letter => {
            const isGuessed = guessedLetters.includes(letter);
            const isCorrect = isGuessed && word.includes(letter);
            return (
              <button
                key={letter}
                onClick={() => handleGuess(letter)}
                disabled={isGuessed}
                className={`w-10 h-10 text-[10px] border-2 flex items-center justify-center transition-all
                  ${!isGuessed ? 'border-white bg-slate-800 hover:bg-slate-600' : 
                    isCorrect ? 'border-green-500 bg-green-900/40 text-green-500' : 'border-red-900 bg-red-900/20 text-red-900'}
                `}
              >
                {letter}
              </button>
            );
          })}
        </div>

        {/* Modals */}
        {gameState !== 'playing' && (
          <div className="absolute inset-0 z-20 bg-black/90 flex flex-col items-center justify-center p-8">
            <h2 className={`text-3xl mb-4 ${gameState === 'won' ? 'text-green-400 animate-bounce' : 'text-red-500'}`}>
              {gameState === 'won' ? 'SAVED!' : 'HUNG!'}
            </h2>
            <p className="mb-8 text-xs leading-loose">THE WORD WAS: <br/><span className="text-yellow-400 text-lg">{word}</span></p>
            <div className="flex gap-4">
              <button onClick={initGame} className="px-6 py-4 bg-yellow-400 text-black text-xs border-4 border-black active:translate-y-1">RETRY</button>
              <button onClick={() => navigate('/')} className="px-6 py-4 bg-slate-500 text-black text-xs border-4 border-black active:translate-y-1">MENU</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}