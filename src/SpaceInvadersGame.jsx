import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SpaceInvadersGame() {
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const savedScore = localStorage.getItem('invaders-high-score');
    return savedScore ? parseInt(savedScore, 10) : 0;
  });

  const CANVAS_WIDTH = 600;
  const CANVAS_HEIGHT = 800;

  // We track keys for smooth continuous movement
  const keys = useRef({ left: false, right: false, shoot: false });

  const gameState = useRef({
    player: { x: CANVAS_WIDTH / 2 - 25, y: CANVAS_HEIGHT - 60, width: 50, height: 40, speed: 6 },
    lasers: [],
    enemies: [],
    stars: [],
    score: 0,
    lastEnemySpawn: 0,
    lastShot: 0,
    gameSpeedMultiplier: 1,
    animationId: null,
  });

  // --- INITIALIZE STARS ---
  useEffect(() => {
    const stars = [];
    for (let i = 0; i < 100; i++) {
      stars.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 3 + 1,
      });
    }
    gameState.current.stars = stars;
  }, []);

  // --- CONTROLS ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
      if (e.key === 'ArrowLeft') keys.current.left = true;
      if (e.key === 'ArrowRight') keys.current.right = true;
      if (e.key === ' ') keys.current.shoot = true;
    };
    const handleKeyUp = (e) => {
      if (e.key === 'ArrowLeft') keys.current.left = false;
      if (e.key === 'ArrowRight') keys.current.right = false;
      if (e.key === ' ') keys.current.shoot = false;
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleGameOver = () => {
    setIsGameOver(true);
    setIsPlaying(false);
    const finalScore = Math.floor(gameState.current.score);
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('invaders-high-score', finalScore.toString());
    }
  };

  // --- GAME LOOP ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const drawGame = (timestamp) => {
      if (!isPlaying || isGameOver) return;
      const state = gameState.current;

      // Clear Screen
      ctx.fillStyle = '#020617'; // Very dark blue/black space
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // --- 1. Update & Draw Stars ---
      ctx.fillStyle = '#ffffff';
      state.stars.forEach(star => {
        star.y += star.speed;
        if (star.y > CANVAS_HEIGHT) {
          star.y = 0;
          star.x = Math.random() * CANVAS_WIDTH;
        }
        ctx.fillRect(star.x, star.y, star.size, star.size);
      });

      // --- 2. Update Player ---
      if (keys.current.left && state.player.x > 0) {
        state.player.x -= state.player.speed;
      }
      if (keys.current.right && state.player.x < CANVAS_WIDTH - state.player.width) {
        state.player.x += state.player.speed;
      }

      // Draw Player Ship (Simple geometric pixel shape)
      ctx.fillStyle = '#06b6d4'; // Cyan
      ctx.fillRect(state.player.x, state.player.y + 10, state.player.width, state.player.height - 10); // Base
      ctx.fillRect(state.player.x + 20, state.player.y, 10, 10); // Nose

      // --- 3. Update & Draw Lasers ---
      if (keys.current.shoot && timestamp - state.lastShot > 250) { // Shoot cooldown
        state.lasers.push({
          x: state.player.x + state.player.width / 2 - 3,
          y: state.player.y,
          width: 6,
          height: 15,
          speed: 10
        });
        state.lastShot = timestamp;
      }

      ctx.fillStyle = '#eab308'; // Yellow laser
      for (let i = state.lasers.length - 1; i >= 0; i--) {
        const laser = state.lasers[i];
        laser.y -= laser.speed;
        ctx.fillRect(laser.x, laser.y, laser.width, laser.height);
        if (laser.y < -20) state.lasers.splice(i, 1); // Remove off-screen lasers
      }

      // --- 4. Spawn, Update & Draw Enemies ---
      state.gameSpeedMultiplier += 0.0005; // Slowly increase difficulty

      if (timestamp - state.lastEnemySpawn > 1000 / state.gameSpeedMultiplier) {
        const size = 40;
        state.enemies.push({
          x: Math.random() * (CANVAS_WIDTH - size),
          y: -size,
          width: size,
          height: size,
          speed: (Math.random() * 2 + 1) * state.gameSpeedMultiplier,
          hp: 1
        });
        state.lastEnemySpawn = timestamp;
      }

      ctx.fillStyle = '#ef4444'; // Red enemies
      for (let i = state.enemies.length - 1; i >= 0; i--) {
        const enemy = state.enemies[i];
        enemy.y += enemy.speed;

        // Draw Enemy
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        ctx.fillStyle = '#020617';
        ctx.fillRect(enemy.x + 10, enemy.y + 10, 8, 8); // Left eye
        ctx.fillRect(enemy.x + 22, enemy.y + 10, 8, 8); // Right eye
        ctx.fillStyle = '#ef4444';

        // Check Collision with Player OR Bottom of Screen
        if (
          enemy.y + enemy.height > CANVAS_HEIGHT || 
          (enemy.x < state.player.x + state.player.width &&
           enemy.x + enemy.width > state.player.x &&
           enemy.y < state.player.y + state.player.height &&
           enemy.y + enemy.height > state.player.y)
        ) {
          handleGameOver();
          return; // Stop processing frame
        }

        // Check Collision with Lasers
        for (let j = state.lasers.length - 1; j >= 0; j--) {
          const laser = state.lasers[j];
          if (
            laser.x < enemy.x + enemy.width &&
            laser.x + laser.width > enemy.x &&
            laser.y < enemy.y + enemy.height &&
            laser.y + laser.height > enemy.y
          ) {
            // Hit!
            state.enemies.splice(i, 1);
            state.lasers.splice(j, 1);
            state.score += 100;
            setScore(state.score);
            break; // Move to next enemy
          }
        }
      }

      state.animationId = requestAnimationFrame(drawGame);
    };

    if (isPlaying && !isGameOver) {
      gameState.current.animationId = requestAnimationFrame(drawGame);
    }
    return () => cancelAnimationFrame(gameState.current.animationId);
  }, [isPlaying, isGameOver, highScore]);

  const startGame = () => {
    gameState.current.lasers = [];
    gameState.current.enemies = [];
    gameState.current.score = 0;
    gameState.current.gameSpeedMultiplier = 1;
    gameState.current.player.x = CANVAS_WIDTH / 2 - 25;
    keys.current = { left: false, right: false, shoot: false };
    
    setScore(0);
    setIsGameOver(false);
    setIsPlaying(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 font-['Press_Start_2P',_monospace] text-white flex flex-col items-center py-10 px-4">
      
      <div className="w-full max-w-2xl flex justify-between items-center bg-slate-800 p-4 border-4 border-slate-950 shadow-[8px_8px_0px_rgba(0,0,0,0.6)] mb-6">
        <h1 className="text-xl text-yellow-400">PIXEL INVADERS</h1>
        <div className="text-right">
          <div className="text-xs text-slate-400 mb-1">HI-SCORE: {highScore}</div>
          <div className="text-xl text-green-400">SCORE: {score}</div>
        </div>
      </div>

      <div className="relative border-8 border-slate-950 shadow-[12px_12px_0px_rgba(0,0,0,0.6)] bg-black w-full max-w-2xl overflow-hidden aspect-[3/4]">
        <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="w-full h-full block" />

        {!isPlaying && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10 p-4 text-center">
            {isGameOver ? (
              <>
                <h2 className="text-4xl text-red-500 mb-4 animate-bounce">GAME OVER</h2>
                <p className="text-xl text-white mb-2">FINAL SCORE: {score}</p>
                {score > 0 && score >= highScore && (
                  <p className="text-sm text-yellow-400 mb-8 animate-pulse">NEW HIGH SCORE!</p>
                )}
                <div className="flex gap-4 mt-6">
                  <button onClick={startGame} className="px-6 py-4 bg-green-400 hover:bg-green-300 text-slate-900 border-4 border-slate-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none">RESTART</button>
                  <button onClick={() => navigate('/')} className="px-6 py-4 bg-slate-400 hover:bg-slate-300 text-slate-900 border-4 border-slate-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none">MENU</button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-3xl text-yellow-400 mb-4">PIXEL INVADERS</h2>
                <p className="text-xs text-slate-300 mb-8 leading-loose">Left/Right Arrows to move.<br/>Spacebar to shoot.</p>
                <button onClick={startGame} className="px-6 py-4 bg-yellow-400 hover:bg-yellow-300 text-slate-900 border-4 border-slate-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none">START GAME</button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Mobile / On-Screen Controls */}
      <div className="w-full max-w-2xl flex gap-2 mt-8 md:hidden">
        <button 
          onPointerDown={() => keys.current.left = true} 
          onPointerUp={() => keys.current.left = false}
          onPointerLeave={() => keys.current.left = false}
          className="flex-1 py-6 bg-slate-700 border-4 border-slate-950 active:bg-slate-600 text-2xl"
        >⬅️</button>
        <button 
          onPointerDown={() => keys.current.shoot = true} 
          onPointerUp={() => keys.current.shoot = false}
          onPointerLeave={() => keys.current.shoot = false}
          className="flex-[2] py-6 bg-red-600 border-4 border-slate-950 active:bg-red-500 text-xl font-bold"
        >SHOOT</button>
        <button 
          onPointerDown={() => keys.current.right = true} 
          onPointerUp={() => keys.current.right = false}
          onPointerLeave={() => keys.current.right = false}
          className="flex-1 py-6 bg-slate-700 border-4 border-slate-950 active:bg-slate-600 text-2xl"
        >➡️</button>
      </div>

    </div>
  );
}