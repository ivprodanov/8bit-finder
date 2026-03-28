import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TrainGame() {
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  
  // --- FIX 1: Current score always starts at 0 ---
  const [score, setScore] = useState(0);

  // --- NEW 1: Separate state for High Score ---
  const [highScore, setHighScore] = useState(() => {
    const savedScore = localStorage.getItem('train-high-score');
    return savedScore ? parseInt(savedScore, 10) : 0;
  });

  const spritesRef = useRef({
    player: null,
    enemyTrain: null,
    rock: null,
  });

  const gameState = useRef({
    lane: 1,
    score: 0,
    speed: 5,
    obstacles: [],
    animationId: null,
    lastSpawn: 0
  });

  const LANES = [80, 200, 320]; 
  const PLAYER_X = 100;

  useEffect(() => {
    const playerImg = new Image();
    playerImg.src = '/assets/player-train.png'; 
    const enemyImg = new Image();
    enemyImg.src = '/assets/enemy-train.png';
    const rockImg = new Image();
    rockImg.src = '/assets/rock.png';

    spritesRef.current = { player: playerImg, enemyTrain: enemyImg, rock: rockImg };
  }, []);

  const moveUp = () => { if (gameState.current.lane > 0) gameState.current.lane -= 1; };
  const moveDown = () => { if (gameState.current.lane < 2) gameState.current.lane += 1; };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown'].includes(e.key)) e.preventDefault();
      if (!isPlaying || isGameOver) return;
      if (e.key === 'ArrowUp') moveUp();
      if (e.key === 'ArrowDown') moveDown();
    };
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isGameOver]);

  // --- FIX 2: Added highScore to the dependency array here ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const sprites = spritesRef.current; 

    const drawGame = (timestamp) => {
      if (!isPlaying || isGameOver) return;
      const state = gameState.current;
      
      ctx.fillStyle = '#4ade80'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#475569';
      LANES.forEach(y => {
        ctx.fillStyle = '#334155'; 
        ctx.fillRect(0, y - 25, canvas.width, 50);

        ctx.fillStyle = '#5c4033'; 
        const tieSpacing = 40; 
        const offset = (timestamp / 10 * state.speed) % tieSpacing;
        
        for (let i = 0; i < canvas.width + tieSpacing; i += tieSpacing) {
          ctx.fillRect(i - offset, y - 20, 10, 40); 
        }

        ctx.fillStyle = '#94a3b8'; 
        ctx.fillRect(0, y - 15, canvas.width, 4); 
        ctx.fillRect(0, y + 11, canvas.width, 4); 
      });

      state.score += 0.1;
      state.speed += 0.001; 
      setScore(Math.floor(state.score)); 

      if (timestamp - state.lastSpawn > 1500 / (state.speed / 5)) {
        state.lastSpawn = timestamp;
        const randomLane = Math.floor(Math.random() * 3);
        const isTrain = Math.random() > 0.5;
        
        state.obstacles.push({
          x: canvas.width + 50,
          lane: randomLane,
          y: LANES[randomLane],
          type: isTrain ? 'train' : 'rock',
          width: isTrain ? 80 : 40,
          height: 40,
          speedMult: isTrain ? 1.5 : 1
        });
      }

      const playerY = LANES[state.lane];
      if (sprites.player && sprites.player.complete) {
        ctx.drawImage(sprites.player, PLAYER_X, playerY - 30, 80, 60); 
      } else {
        ctx.fillStyle = '#3b82f6'; 
        ctx.fillRect(PLAYER_X, playerY - 20, 60, 40);
      }

      for (let i = state.obstacles.length - 1; i >= 0; i--) {
        const obs = state.obstacles[i];
        obs.x -= state.speed * obs.speedMult;

        if (obs.type === 'train') {
          if (sprites.enemyTrain && sprites.enemyTrain.complete) {
            ctx.drawImage(sprites.enemyTrain, obs.x, obs.y - 30, obs.width, 60);
          } else {
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(obs.x, obs.y - 20, obs.width, obs.height);
          }
        } else {
          if (sprites.rock && sprites.rock.complete) {
            ctx.drawImage(sprites.rock, obs.x, obs.y - 25, obs.width, 50);
          } else {
            ctx.fillStyle = '#78350f';
            ctx.fillRect(obs.x, obs.y - 20, obs.width, obs.height);
          }
        }

        if (
          state.lane === obs.lane &&
          PLAYER_X < obs.x + obs.width &&
          PLAYER_X + 60 > obs.x 
        ) {
          setIsGameOver(true);
          setIsPlaying(false);

          // --- NEW 2: Save High Score on Collision ---
          const finalScore = Math.floor(state.score);
          if (finalScore > highScore) {
            setHighScore(finalScore);
            localStorage.setItem('train-high-score', finalScore.toString());
          }
        }

        if (obs.x < -100) state.obstacles.splice(i, 1);
      }

      state.animationId = requestAnimationFrame(drawGame);
    };

    if (isPlaying && !isGameOver) {
      gameState.current.animationId = requestAnimationFrame(drawGame);
    }

    return () => cancelAnimationFrame(gameState.current.animationId);
  }, [isPlaying, isGameOver, highScore]); // <-- Added highScore to dependencies

  const startGame = () => {
    gameState.current = {
      lane: 1,
      score: 0,
      speed: 5,
      obstacles: [],
      animationId: null,
      lastSpawn: performance.now()
    };
    setScore(0);
    setIsGameOver(false);
    setIsPlaying(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 font-['Press_Start_2P',_monospace] text-white flex flex-col items-center py-10 px-4">
      
      <div className="w-full max-w-4xl flex justify-between items-center bg-slate-800 p-4 border-4 border-slate-950 shadow-[8px_8px_0px_rgba(0,0,0,0.6)] mb-6">
        <h1 className="text-xl text-yellow-400">RAIL DODGER</h1>
        
        {/* --- NEW 3: Display High Score in HUD --- */}
        <div className="text-right">
          <div className="text-xs text-slate-400 mb-1">HI-SCORE: {highScore}</div>
          <div className="text-2xl text-green-400">SCORE: {score}</div>
        </div>
      </div>

      <div className="relative border-8 border-slate-950 shadow-[12px_12px_0px_rgba(0,0,0,0.6)] bg-black w-full max-w-4xl overflow-hidden aspect-[2/1]">
        <canvas 
          ref={canvasRef} 
          width={800} 
          height={400} 
          className="w-full h-full block"
          style={{ imageRendering: 'pixelated' }} 
        />

        {!isPlaying && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10 p-4 text-center">
            {isGameOver ? (
              <>
                <h2 className="text-4xl text-red-500 mb-4 animate-bounce">CRASHED!</h2>
                <p className="text-xl text-white mb-2">FINAL SCORE: {score}</p>
                
                {/* --- NEW 4: Celebration Text --- */}
                {score > 0 && score >= highScore && (
                  <p className="text-sm text-yellow-400 mb-8 animate-pulse">NEW HIGH SCORE!</p>
                )}
                {score < highScore && (
                  <p className="text-sm text-slate-400 mb-8">Best: {highScore}</p>
                )}

                <div className="flex gap-4">
                  <button onClick={startGame} className="px-6 py-4 bg-yellow-400 hover:bg-yellow-300 text-slate-900 border-4 border-slate-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none">RESTART</button>
                  <button onClick={() => navigate('/')} className="px-6 py-4 bg-slate-400 hover:bg-slate-300 text-slate-900 border-4 border-slate-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none">MENU</button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-3xl text-yellow-400 mb-4">RAIL DODGER</h2>
                <p className="text-xs text-slate-300 mb-8 leading-loose">Use UP/DOWN arrows or buttons to switch lanes.<br/>Avoid rocks and oncoming trains!</p>
                <button onClick={startGame} className="px-6 py-4 bg-yellow-400 hover:bg-yellow-300 text-slate-900 border-4 border-slate-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none">START GAME</button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="w-full max-w-4xl flex gap-4 mt-8">
        <button onClick={moveUp} className="flex-1 py-8 bg-indigo-600 hover:bg-indigo-500 border-4 border-slate-950 shadow-[6px_6px_0px_rgba(0,0,0,0.6)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none text-2xl">⬆️ UP</button>
        <button onClick={moveDown} className="flex-1 py-8 bg-indigo-600 hover:bg-indigo-500 border-4 border-slate-950 shadow-[6px_6px_0px_rgba(0,0,0,0.6)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none text-2xl">⬇️ DOWN</button>
      </div>

    </div>
  );
}