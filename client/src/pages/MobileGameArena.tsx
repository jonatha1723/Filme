import { useEffect, useRef, useState } from 'react';
import { useLocation, useSearch } from 'wouter';
import VirtualJoystick from '@/components/VirtualJoystick';
import { Button } from '@/components/ui/button';
import { X, Settings, Users } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  health: number;
  kills: number;
  deaths: number;
  team: 'team_a' | 'team_b';
}

interface GameState {
  mode: '5v5' | 'ranked';
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
  const [gameState, setGameState] = useState<GameState>({
    mode: new URLSearchParams(search).get('mode') as '5v5' | 'ranked',
    status: 'waiting',
    players: [],
    teamAKills: 0,
    teamBKills: 0,
    timeRemaining: 600,
  });
  const [playerHealth, setPlayerHealth] = useState(100);
  const [playerAmmo, setPlayerAmmo] = useState(30);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Initialize game
    const initGame = async () => {
      // Simulate game start
      setGameState((prev) => ({
        ...prev,
        status: 'in_progress',
        players: generateMockPlayers(gameState.mode),
      }));
    };

    initGame();
  }, []);

  useEffect(() => {
    // Game loop
    const gameLoop = setInterval(() => {
      setGameState((prev) => ({
        ...prev,
        timeRemaining: Math.max(0, prev.timeRemaining - 1),
      }));
    }, 1000);

    return () => clearInterval(gameLoop);
  }, []);

  const generateMockPlayers = (mode: '5v5' | 'ranked'): Player[] => {
    if (mode === '5v5') {
      return [
        { id: '1', name: 'You', health: 100, kills: 5, deaths: 2, team: 'team_a' },
        { id: '2', name: 'Player2', health: 75, kills: 3, deaths: 1, team: 'team_a' },
        { id: '3', name: 'Player3', health: 50, kills: 2, deaths: 3, team: 'team_a' },
        { id: '4', name: 'Player4', health: 100, kills: 4, deaths: 0, team: 'team_a' },
        { id: '5', name: 'Player5', health: 25, kills: 1, deaths: 4, team: 'team_a' },
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
    // Handle player movement
    console.log('Moving:', x, y);
  };

  const handleShoot = () => {
    // Handle shooting
    setPlayerAmmo((prev) => Math.max(0, prev - 1));
  };

  const handleReload = () => {
    setPlayerAmmo(30);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden">
      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ touchAction: 'none' }}
      />

      {/* HUD Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top HUD */}
        <div className="absolute top-0 left-0 right-0 p-4 pointer-events-auto">
          <div className="flex items-center justify-between">
            {/* Team Scores */}
            <div className="bg-white/10 backdrop-blur-md rounded-lg px-4 py-2 border border-white/20">
              <div className="flex gap-4 text-white font-bold">
                <span className="text-blue-400">Team A: {gameState.teamAKills}</span>
                <span className="text-red-400">Team B: {gameState.teamBKills}</span>
              </div>
            </div>

            {/* Timer */}
            <div className="bg-white/10 backdrop-blur-md rounded-lg px-4 py-2 border border-white/20 text-white font-bold">
              {formatTime(gameState.timeRemaining)}
            </div>

            {/* Settings Button */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg p-2 border border-white/20 text-white transition-colors pointer-events-auto"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center Crosshair */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-8 h-8 border-2 border-green-400/50 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-green-400 transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        {/* Bottom HUD */}
        <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-auto">
          <div className="flex items-end justify-between">
            {/* Player Stats */}
            <div className="bg-white/10 backdrop-blur-md rounded-lg px-4 py-3 border border-white/20 space-y-2">
              {/* Health */}
              <div className="text-white text-sm font-bold mb-1">Saúde</div>
              <div className="w-32 h-4 bg-black/50 rounded-full overflow-hidden border border-red-500/50">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all"
                  style={{ width: `${playerHealth}%` }}
                />
              </div>

              {/* Ammo */}
              <div className="text-white text-sm font-bold mt-2 mb-1">Munição</div>
              <div className="text-yellow-400 font-bold">{playerAmmo} / 30</div>
            </div>

            {/* Minimap */}
            <div className="w-24 h-24 bg-black/50 border-2 border-white/20 rounded-lg overflow-hidden">
              <div className="w-full h-full relative">
                {/* Team A players */}
                {gameState.players
                  .filter((p) => p.team === 'team_a')
                  .map((p) => (
                    <div
                      key={p.id}
                      className="absolute w-2 h-2 bg-blue-500 rounded-full"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                    />
                  ))}

                {/* Team B players */}
                {gameState.players
                  .filter((p) => p.team === 'team_b')
                  .map((p) => (
                    <div
                      key={p.id}
                      className="absolute w-2 h-2 bg-red-500 rounded-full"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                    />
                  ))}

                {/* Player position */}
                <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-green-400 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Scoreboard */}
            <div className="bg-white/10 backdrop-blur-md rounded-lg px-3 py-2 border border-white/20 max-h-24 overflow-y-auto">
              <div className="text-white text-xs font-bold mb-1">Placar</div>
              <div className="space-y-1 text-xs">
                {gameState.players.slice(0, 4).map((p) => (
                  <div key={p.id} className={p.team === 'team_a' ? 'text-blue-400' : 'text-red-400'}>
                    {p.name}: {p.kills}K {p.deaths}D
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 pointer-events-auto">
          <div className="bg-slate-800 rounded-lg p-6 max-w-sm w-full mx-4 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Configurações</h2>
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
                  className="flex-1"
                  onClick={() => setShowSettings(false)}
                >
                  Fechar
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => setLocation('/lobby')}
                >
                  Sair do Jogo
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Virtual Joystick */}
      <VirtualJoystick onMove={handleMove} onShoot={handleShoot} size={100} />
    </div>
  );
}
