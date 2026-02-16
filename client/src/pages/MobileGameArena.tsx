import { useEffect, useRef, useState } from 'react';
import { useLocation, useSearch } from 'wouter';
import * as THREE from 'three';
import { Mobile3DEngine } from '@/lib/Mobile3DEngine';
import VirtualJoystick from '@/components/VirtualJoystick';
import { Button } from '@/components/ui/button';
import { X, Settings } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  health: number;
  kills: number;
  deaths: number;
  team: 'team_a' | 'team_b';
}

interface GameState {
  mode: '5v5' | 'ranked' | 'training';
  status: 'waiting' | 'in_progress' | 'finished';
  players: Player[];
  teamAKills: number;
  teamBKills: number;
  timeRemaining: number;
}

export default function MobileGameArena() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Mobile3DEngine | null>(null);
  const animationIdRef = useRef<number | null>(null);

  const [gameState, setGameState] = useState<GameState>({
    mode: new URLSearchParams(search).get('mode') as '5v5' | 'ranked' | 'training' || 'training',
    status: 'waiting',
    players: [],
    teamAKills: 0,
    teamBKills: 0,
    timeRemaining: 600,
  });

  const [playerHealth, setPlayerHealth] = useState(100);
  const [playerAmmo, setPlayerAmmo] = useState(30);
  const [playerKills, setPlayerKills] = useState(0);
  const [playerDeaths, setPlayerDeaths] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [joystickInput, setJoystickInput] = useState({ x: 0, y: 0 });

  // Initialize 3D engine
  useEffect(() => {
    if (!canvasRef.current) return;

    try {
      const engine = new Mobile3DEngine(canvasRef.current);
      engineRef.current = engine;

    // Add mock players
    const mockPlayers = generateMockPlayers(gameState.mode);
    setGameState((prev) => ({
      ...prev,
      status: 'in_progress',
      players: mockPlayers,
    }));

    // Add players to 3D scene
    mockPlayers.forEach((player, index) => {
      const position = new THREE.Vector3(
        Math.cos((index / mockPlayers.length) * Math.PI * 2) * 30,
        0,
        Math.sin((index / mockPlayers.length) * Math.PI * 2) * 30
      );
      engine.addPlayer(player.id, position, player.id === '1');
    });

    // Game loop
    const gameLoop = () => {
      // Update camera based on joystick input
      if (joystickInput.x !== 0 || joystickInput.y !== 0) {
        const direction = new THREE.Vector3(joystickInput.x, 0, joystickInput.y);
        engine.moveCamera(direction);
      }

      // Render
      engine.render();

      animationIdRef.current = requestAnimationFrame(gameLoop);
    };

    animationIdRef.current = requestAnimationFrame(gameLoop);

    // Handle touch input for camera rotation
    let lastX = 0;
    let lastY = 0;

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const deltaX = touch.clientX - lastX;
        const deltaY = touch.clientY - lastY;

        engine.updateCameraRotation(deltaX, deltaY);

        lastX = touch.clientX;
        lastY = touch.clientY;
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;
      }
    };

    canvasRef.current.addEventListener('touchstart', handleTouchStart);
    canvasRef.current.addEventListener('touchmove', handleTouchMove);

    // Timer
    const timerInterval = setInterval(() => {
      setGameState((prev) => ({
        ...prev,
        timeRemaining: Math.max(0, prev.timeRemaining - 1),
      }));
    }, 1000);

      return () => {
        if (animationIdRef.current) {
          cancelAnimationFrame(animationIdRef.current);
        }
        canvasRef.current?.removeEventListener('touchstart', handleTouchStart);
        canvasRef.current?.removeEventListener('touchmove', handleTouchMove);
        clearInterval(timerInterval);
        engine.dispose();
      };
    } catch (error) {
      console.error('Failed to initialize game engine:', error);
    }
  }, []);

  const generateMockPlayers = (mode: '5v5' | 'ranked'): Player[] => {
    if (mode === '5v5') {
      return [
        { id: '1', name: 'You', health: 100, kills: 5, deaths: 2, team: 'team_a' },
        { id: '2', name: 'Ally1', health: 75, kills: 3, deaths: 1, team: 'team_a' },
        { id: '3', name: 'Ally2', health: 50, kills: 2, deaths: 3, team: 'team_a' },
        { id: '4', name: 'Ally3', health: 100, kills: 4, deaths: 0, team: 'team_a' },
        { id: '5', name: 'Ally4', health: 25, kills: 1, deaths: 4, team: 'team_a' },
        { id: '6', name: 'Enemy1', health: 80, kills: 4, deaths: 2, team: 'team_b' },
        { id: '7', name: 'Enemy2', health: 100, kills: 6, deaths: 1, team: 'team_b' },
        { id: '8', name: 'Enemy3', health: 40, kills: 2, deaths: 3, team: 'team_b' },
        { id: '9', name: 'Enemy4', health: 100, kills: 5, deaths: 1, team: 'team_b' },
        { id: '10', name: 'Enemy5', health: 60, kills: 3, deaths: 2, team: 'team_b' },
      ];
    } else {
      return [
        { id: '1', name: 'You', health: 100, kills: 0, deaths: 0, team: 'team_a' },
        { id: '2', name: 'Opponent', health: 100, kills: 0, deaths: 0, team: 'team_b' },
      ];
    }
  };

  const handleMove = (x: number, y: number) => {
    setJoystickInput({ x, y });
  };

  const handleShoot = () => {
    setPlayerAmmo((prev) => Math.max(0, prev - 1));
    // Play shoot animation/sound
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* 3D Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ touchAction: 'none' }}
      />

      {/* HUD Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top HUD */}
        <div className="absolute top-0 left-0 right-0 p-3 pointer-events-auto">
          <div className="flex items-center justify-between">
            {/* Team Scores */}
            <div className="bg-black/60 backdrop-blur-md rounded-lg px-3 py-2 border border-white/20">
              <div className="flex gap-3 text-white font-bold text-sm">
                <span className="text-blue-400">Team A: {gameState.teamAKills}</span>
                <span className="text-red-400">Team B: {gameState.teamBKills}</span>
              </div>
            </div>

            {/* Timer */}
            <div className="bg-black/60 backdrop-blur-md rounded-lg px-3 py-2 border border-white/20 text-white font-bold text-sm">
              {formatTime(gameState.timeRemaining)}
            </div>

            {/* Settings Button */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-lg p-2 border border-white/20 text-white transition-colors pointer-events-auto"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center Crosshair */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-6 h-6 border-2 border-green-400/70 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-green-400 transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute top-1/2 left-0 w-3 h-0.5 bg-green-400/50 transform -translate-y-1/2"></div>
          <div className="absolute top-1/2 right-0 w-3 h-0.5 bg-green-400/50 transform -translate-y-1/2"></div>
          <div className="absolute top-0 left-1/2 h-3 w-0.5 bg-green-400/50 transform -translate-x-1/2"></div>
          <div className="absolute bottom-0 left-1/2 h-3 w-0.5 bg-green-400/50 transform -translate-x-1/2"></div>
        </div>

        {/* Bottom HUD */}
        <div className="absolute bottom-0 left-0 right-0 p-3 pointer-events-auto">
          <div className="flex items-end justify-between gap-2">
            {/* Player Stats */}
            <div className="bg-black/60 backdrop-blur-md rounded-lg px-3 py-2 border border-white/20 space-y-2 text-xs">
              {/* Health */}
              <div className="text-white font-bold mb-1">HP</div>
              <div className="w-24 h-3 bg-black/50 rounded-full overflow-hidden border border-red-500/50">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all"
                  style={{ width: `${playerHealth}%` }}
                />
              </div>

              {/* Ammo */}
              <div className="text-white font-bold mt-2 mb-1">Munição</div>
              <div className="text-yellow-400 font-bold">{playerAmmo}</div>

              {/* Kills/Deaths */}
              <div className="text-white font-bold mt-2 mb-1">K/D</div>
              <div className="text-blue-400 font-bold">
                {playerKills}/{playerDeaths}
              </div>
            </div>

            {/* Minimap */}
            <div className="w-20 h-20 bg-black/60 border-2 border-white/20 rounded-lg overflow-hidden">
              <div className="w-full h-full relative">
                {/* Team A players */}
                {gameState.players
                  .filter((p) => p.team === 'team_a')
                  .map((p, i) => (
                    <div
                      key={p.id}
                      className="absolute w-1.5 h-1.5 bg-blue-500 rounded-full"
                      style={{
                        left: `${(i % 3) * 30 + 10}%`,
                        top: `${Math.floor(i / 3) * 30 + 10}%`,
                      }}
                    />
                  ))}

                {/* Team B players */}
                {gameState.players
                  .filter((p) => p.team === 'team_b')
                  .map((p, i) => (
                    <div
                      key={p.id}
                      className="absolute w-1.5 h-1.5 bg-red-500 rounded-full"
                      style={{
                        left: `${(i % 3) * 30 + 10}%`,
                        top: `${Math.floor(i / 3) * 30 + 10}%`,
                      }}
                    />
                  ))}

                {/* Player position */}
                <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-green-400 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 pointer-events-auto">
          <div className="bg-slate-800 rounded-lg p-6 max-w-sm w-full mx-4 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Configurações</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-white hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-white text-sm font-semibold block mb-2">Volume</label>
                <input type="range" min="0" max="100" defaultValue="50" className="w-full" />
              </div>

              <div>
                <label className="text-white text-sm font-semibold block mb-2">Sensibilidade</label>
                <input type="range" min="0" max="100" defaultValue="50" className="w-full" />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1 text-xs"
                  onClick={() => setShowSettings(false)}
                >
                  Fechar
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 text-xs"
                  onClick={() => setLocation('/lobby')}
                >
                  Sair
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Virtual Joystick */}
      <VirtualJoystick onMove={handleMove} onShoot={handleShoot} size={80} />
    </div>
  );
}
