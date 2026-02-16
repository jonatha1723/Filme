import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, X } from "lucide-react";
import { useLocation } from "wouter";
import { useGameInput } from "@/hooks/useGameInput";
import { GameEngine } from "@/lib/GameEngine";
import { MultiplayerSync, PlayerState } from "@/lib/MultiplayerSync";
import * as THREE from "three";

interface GameArenaProps {
  matchId: number;
}

export default function GameArena({ matchId }: GameArenaProps) {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const multiplayerRef = useRef<MultiplayerSync | null>(null);
  const input = useGameInput();
  
  const [gameState, setGameState] = useState({
    health: 100,
    ammo: 30,
    kills: 0,
    deaths: 0,
    gameTime: 0,
    playersOnline: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [remotePlayers, setRemotePlayers] = useState<Map<number, PlayerState>>(new Map());

  const gameTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | undefined>(undefined);

  // Initialize game
  useEffect(() => {
    if (!containerRef.current || !user) return;

    const initializeGame = async () => {
      try {
        // Initialize game engine
        const engine = new GameEngine(containerRef.current!);
        gameEngineRef.current = engine;

        // Initialize local player
        engine.initializeLocalPlayer(user.id, user.name || "Player", new THREE.Vector3(0, 5, 0));

        // Initialize multiplayer sync
        const sync = new MultiplayerSync(matchId, user.id, user.name || "Player");
        multiplayerRef.current = sync;

        // Setup multiplayer callbacks
        sync.setOnPlayerUpdate((state: PlayerState) => {
          setRemotePlayers((prev) => {
            const newMap = new Map(prev);
            newMap.set(state.id, state);
            return newMap;
          });
        });

        sync.setOnPlayerJoin((state: PlayerState) => {
          setRemotePlayers((prev) => {
            const newMap = new Map(prev);
            newMap.set(state.id, state);
            return newMap;
          });
          setGameState((prev) => ({ ...prev, playersOnline: prev.playersOnline + 1 }));
        });

        sync.setOnPlayerLeave((userId: number) => {
          setRemotePlayers((prev) => {
            const newMap = new Map(prev);
            newMap.delete(userId);
            return newMap;
          });
          setGameState((prev) => ({ ...prev, playersOnline: Math.max(0, prev.playersOnline - 1) }));
        });

        sync.setOnPlayerDamaged((damage) => {
          if (damage.victimId === user.id) {
            engine.takeDamage(damage.damage);
            setGameState((prev) => ({
              ...prev,
              health: Math.max(0, prev.health - damage.damage),
            }));
          }
        });

        // Connect to multiplayer
        await sync.connect();

        // Game loop
        const gameLoop = () => {
          // input is already available from hook
          const deltaTime = 1 / 60; // 60 FPS target

          // Handle shooting
          if (input.shoot) {
            engine.shoot();
          }

          // Handle reload
          if (input.reload) {
            engine.reload();
          }

          // Update game engine
          engine.update(input, deltaTime);

          // Update game time
          gameTimeRef.current += deltaTime;
          setGameState((prev) => ({
            ...prev,
            gameTime: Math.floor(gameTimeRef.current),
          }));

          // Broadcast player state
          const localPlayer = engine.getLocalPlayer();
          if (localPlayer) {
            sync.broadcastPlayerState(
              localPlayer.position,
              localPlayer.rotation,
              localPlayer.health,
              localPlayer.ammo,
              localPlayer.isAlive
            );

            setGameState((prev) => ({
              ...prev,
              health: localPlayer.health,
              ammo: localPlayer.ammo,
            }));
          }

          animationFrameRef.current = requestAnimationFrame(gameLoop) as any;
        };

        animationFrameRef.current = requestAnimationFrame(gameLoop);

        setIsLoading(false);
      } catch (error) {
        console.error("Failed to initialize game:", error);
        setIsLoading(false);
      }
    };

    initializeGame();

    return () => {
      if (animationFrameRef.current !== undefined) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (multiplayerRef.current) {
        multiplayerRef.current.disconnect();
      }
      if (gameEngineRef.current) {
        gameEngineRef.current.dispose();
      }
    };
  }, [matchId, user]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        navigate("/");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div ref={containerRef} className="w-full h-screen relative bg-black">
      {/* Loading Screen */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-white text-lg">Carregando Arena...</p>
          </div>
        </div>
      )}

      {/* HUD */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Crosshair */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-8 h-8 border-2 border-red-500 rounded-full opacity-70"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-4 bg-red-500"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-1 w-4 bg-red-500"></div>
        </div>

        {/* Top HUD - Timer and Players */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white text-center pointer-events-auto">
          <div className="text-3xl font-bold text-yellow-400 mb-2">
            {formatTime(gameState.gameTime)}
          </div>
          <div className="text-sm text-slate-300">
            Jogadores online: {gameState.playersOnline + 1}
          </div>
        </div>

        {/* Bottom Left - Health and Ammo */}
        <div className="absolute bottom-4 left-4 space-y-2 text-white pointer-events-auto">
          <Card className="bg-slate-900/80 border-slate-700">
            <CardContent className="p-3 space-y-2">
              <div className="text-sm">
                <div className="flex justify-between mb-1">
                  <span>Vida</span>
                  <span className="font-bold text-green-400">{gameState.health}/100</span>
                </div>
                <div className="w-32 h-4 bg-slate-700 rounded border border-slate-600">
                  <div
                    className="h-full bg-green-500 rounded transition-all"
                    style={{ width: `${gameState.health}%` }}
                  ></div>
                </div>
              </div>

              <div className="text-sm">
                <div className="flex justify-between mb-1">
                  <span>Munição</span>
                  <span className="font-bold text-blue-400">{gameState.ammo}/30</span>
                </div>
                <div className="w-32 h-4 bg-slate-700 rounded border border-slate-600">
                  <div
                    className="h-full bg-blue-500 rounded transition-all"
                    style={{ width: `${(gameState.ammo / 30) * 100}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Right - Stats */}
        <div className="absolute bottom-4 right-4 text-white pointer-events-auto">
          <Card className="bg-slate-900/80 border-slate-700">
            <CardContent className="p-3 space-y-1 text-sm">
              <div className="flex justify-between gap-4">
                <span>
                  Kills: <span className="font-bold text-green-400">{gameState.kills}</span>
                </span>
                <span>
                  Deaths: <span className="font-bold text-red-400">{gameState.deaths}</span>
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leave Game Button */}
        <div className="absolute top-4 right-4 pointer-events-auto">
          <Button
            onClick={() => navigate("/")}
            variant="destructive"
            size="sm"
            className="gap-2"
          >
            <X className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </div>

      {/* Controls Info */}
      <div className="absolute bottom-20 left-4 text-white text-xs opacity-50 pointer-events-none">
        <p>WASD - Mover | Mouse - Olhar | Click - Disparar | R - Recarregar | ESC - Sair</p>
      </div>
    </div>
  );
}
