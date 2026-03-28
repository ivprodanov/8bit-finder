import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SnakeGame() {
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);

  // --- NEW: High Score State ---
  // We use a function inside useState so it only reads from localStorage ONCE when the component loads.
  const [highScore, setHighScore] = useState(() => {
    const savedScore = localStorage.getItem('snake-high-score');
    return savedScore ? parseInt(savedScore, 10) : 0;
  });

  const GRID_SIZE = 20;
  const CANVAS_WIDTH = 600;
  const CANVAS_HEIGHT = 400;

  const gameState = useRef({
    snake: [{ x: 140, y: 200 }, { x: 120, y: 200 }, { x: 100, y: 200 }],
    direction: { x: GRID_SIZE, y: 0 },
    nextDirection: { x: GRID_SIZE, y: 0 },
    apple: { x: 300, y: 200 },
    lastRenderTime: 0,
    speed: 10,
    animationId: null,
  });

  const getRandomApplePos = () => ({
    x: Math.floor((Math.random() * CANVAS_WIDTH) / GRID_SIZE) * GRID_SIZE,
    y: Math.floor((Math.random() * CANVAS_HEIGHT) / GRID_SIZE) * GRID_SIZE,
  });

  // --- NEW: Save High Score Function ---
  const handleGameOver = () => {
    setIsGameOver(true);
    setIsPlaying(false);
    
    // Check if we beat the high score!
    if (gameState.current.score > highScore) {
      setHighScore(gameState.current.score);
      localStorage.setItem('snake-high-score', gameState.current.score.toString());
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
      if (!isPlaying || isGameOver) return;
      const { direction } = gameState.current;

      if (e.key === 'ArrowUp' && direction.y === 0) gameState.current.nextDirection = { x: 0, y: -GRID_SIZE };
      else if (e.key === 'ArrowDown' && direction.y === 0) gameState.current.nextDirection = { x: 0, y: GRID_SIZE };
      else if (e.key === 'ArrowLeft' && direction.x === 0) gameState.current.nextDirection = { x: -GRID_SIZE, y: 0 };
      else if (e.key === 'ArrowRight' && direction.x === 0) gameState.current.nextDirection = { x: GRID_SIZE, y: 0 };
    };
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isGameOver]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const drawGame = (timestamp) => {
      if (!isPlaying || isGameOver) return;
      const state = gameState.current;

      const secondsSinceLastRender = (timestamp - state.lastRenderTime) / 1000;
      if (secondsSinceLastRender < 1 / state.speed) {
        state.animationId = requestAnimationFrame(drawGame);
        return;
      }
      state.lastRenderTime = timestamp;

      state.direction = state.nextDirection;
      const head = { ...state.snake[0] };
      head.x += state.direction.x;
      head.y += state.direction.y;

      // Update handleGameOver calls for walls
      if (head.x < 0 || head.x >= CANVAS_WIDTH || head.y < 0 || head.y >= CANVAS_HEIGHT) {
        handleGameOver();
        return;
      }

      // Update handleGameOver calls for self-collision
      for (let i = 0; i < state.snake.length; i++) {
        if (head.x === state.snake[i].x && head.y === state.snake[i].y) {
          handleGameOver();
          return;
        }
      }

      state.snake.unshift(head);

      if (head.x === state.apple.x && head.y === state.apple.y) {
        // Keep a copy of the score in our ref so the handleGameOver function can access it immediately
        state.score = (state.score || 0) + 10;
        setScore(state.score);
        state.speed += 0.2;
        state.apple = getRandomApplePos();
      } else {
        state.snake.pop();
      }

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let x = 0; x < CANVAS_WIDTH; x += GRID_SIZE) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_HEIGHT); ctx.stroke(); }
      for (let y = 0; y < CANVAS_HEIGHT; y += GRID_SIZE) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_WIDTH, y); ctx.stroke(); }

      ctx.fillStyle = '#ef4444';
      ctx.fillRect(state.apple.x + 1, state.apple.y + 1, GRID_SIZE - 2, GRID_SIZE - 2);

      state.snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#4ade80' : '#22c55e';
        ctx.fillRect(segment.x + 1, segment.y + 1, GRID_SIZE - 2, GRID_SIZE - 2);
      });

      state.animationId = requestAnimationFrame(drawGame);
    };

    if (isPlaying && !isGameOver) {
      gameState.current.animationId = requestAnimationFrame(drawGame);
    }
    return () => cancelAnimationFrame(gameState.current.animationId);
  }, [isPlaying, isGameOver]);

  const startGame = () => {
    gameState.current = {
      snake: [{ x: 140, y: 200 }, { x: 120, y: 200 }, { x: 100, y: 200 }],
      direction: { x: GRID_SIZE, y: 0 },
      nextDirection: { x: GRID_SIZE, y: 0 },
      apple: getRandomApplePos(),
      lastRenderTime: performance.now(),
      speed: 10,
      score: 0, // Reset the ref score
      animationId: null,
    };
    setScore(0);
    setIsGameOver(false);
    setIsPlaying(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 font-['Press_Start_2P',_monospace] text-white flex flex-col items-center py-10 px-4">
      
      <div className="w-full max-w-2xl flex justify-between items-center bg-slate-800 p-4 border-4 border-slate-950 shadow-[8px_8px_0px_rgba(0,0,0,0.6)] mb-6">
        <h1 className="text-xl text-yellow-400">RETRO SNAKE</h1>
        <div className="text-right">
          {/* --- NEW: Display the High Score --- */}
          <div className="text-xs text-slate-400 mb-1">HI-SCORE: {highScore}</div>
          <div className="text-xl text-green-400">SCORE: {score}</div>
        </div>
      </div>

      {/* ... The rest of your Canvas and Modals remain the same ... */}
      <div className="relative border-8 border-slate-950 shadow-[12px_12px_0px_rgba(0,0,0,0.6)] bg-black w-full max-w-2xl overflow-hidden aspect-[3/2]">
        <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="w-full h-full block" />

        {!isPlaying && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10 p-4 text-center">
            {isGameOver ? (
              <>
                <h2 className="text-4xl text-red-500 mb-4 animate-bounce">GAME OVER</h2>
                <p className="text-xl text-white mb-2">FINAL SCORE: {score}</p>
                {/* --- NEW: High Score Celebration --- */}
                {score > 0 && score >= highScore && (
                  <p className="text-sm text-yellow-400 mb-8 animate-pulse">NEW HIGH SCORE!</p>
                )}
                {score < highScore && (
                  <p className="text-sm text-slate-400 mb-8">Best: {highScore}</p>
                )}
                <div className="flex gap-4">
                  <button onClick={startGame} className="px-6 py-4 bg-green-400 hover:bg-green-300 text-slate-900 border-4 border-slate-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none">RESTART</button>
                  <button onClick={() => navigate('/')} className="px-6 py-4 bg-slate-400 hover:bg-slate-300 text-slate-900 border-4 border-slate-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none">MENU</button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-3xl text-yellow-400 mb-4">RETRO SNAKE</h2>
                <p className="text-xs text-slate-300 mb-8 leading-loose">Use Arrow Keys to move.<br/>Eat red apples to grow!</p>
                <button onClick={startGame} className="px-6 py-4 bg-yellow-400 hover:bg-yellow-300 text-slate-900 border-4 border-slate-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none">START GAME</button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}