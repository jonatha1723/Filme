import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import * as THREE from 'three';
import { Mobile3DEngine } from '@/lib/Mobile3DEngine';
import VirtualJoystick from '@/components/VirtualJoystick';
import { Button } from '@/components/ui/button';
import { X, Target, Trophy } from 'lucide-react';

interface TargetStats {
  hits: number;
  misses: number;
  accuracy: number;
  bestStreak: number;
}

export default function TrainingMode() {
  const [, setLocation] = useLocation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Mobile3DEngine | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const isMobile = window.innerWidth < 768;

  const [playerHealth, setPlayerHealth] = useState(100);
  const [playerAmmo, setPlayerAmmo] = useState(30);
  const [maxAmmo] = useState(30);
  const [joystickInput, setJoystickInput] = useState({ x: 0, y: 0 });
  const [stats, setStats] = useState<TargetStats>({
    hits: 0,
    misses: 0,
    accuracy: 0,
    bestStreak: 0,
  });
  const [currentStreak, setCurrentStreak] = useState(0);
  const [trainingTime, setTrainingTime] = useState(0);

  // Initialize 3D engine
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new Mobile3DEngine(canvasRef.current);
    engineRef.current = engine;

    // Add training targets (static bots)
    const targetPositions = [
      new THREE.Vector3(20, 0, 0),
      new THREE.Vector3(-20, 0, 0),
      new THREE.Vector3(0, 0, 20),
      new THREE.Vector3(0, 0, -20),
      new THREE.Vector3(15, 0, 15),
      new THREE.Vector3(-15, 0, -15),
    ];

    targetPositions.forEach((pos, index) => {
      engine.addPlayer(`target_${index}`, pos, false);
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

    // Handle touch input for camera rotation (mobile)
    if (isMobile) {
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

      return () => {
        if (animationIdRef.current) {
          cancelAnimationFrame(animationIdRef.current);
        }
        canvasRef.current?.removeEventListener('touchstart', handleTouchStart);
        canvasRef.current?.removeEventListener('touchmove', handleTouchMove);
        engine.dispose();
      };
    }

    // Handle mouse input for camera rotation (desktop)
    let isPointerLocked = false;

    const handleMouseMove = (e: MouseEvent) => {
      if (isPointerLocked) {
        engine.updateCameraRotation(e.movementX, e.movementY);
      }
    };

    const handleClick = () => {
      if (!isPointerLocked) {
        canvasRef.current?.requestPointerLock();
      }
    };

    const handlePointerLockChange = () => {
      isPointerLocked = document.pointerLockElement === canvasRef.current;
    };

    canvasRef.current.addEventListener('click', handleClick);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.addEventListener('mousemove', handleMouseMove);

    // Timer
    const timerInterval = setInterval(() => {
      setTrainingTime((prev) => prev + 1);
    }, 1000);

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      document.removeEventListener('mousemove', handleMouseMove);
      canvasRef.current?.removeEventListener('click', handleClick);
      clearInterval(timerInterval);
      engine.dispose();
    };
  }, [joystickInput, isMobile]);

  const handleMove = (x: number, y: number) => {
    setJoystickInput({ x, y });
  };

  const handleShoot = () => {
    if (playerAmmo > 0) {
      setPlayerAmmo((prev) => prev - 1);
      
      // Simulate hit detection (random for training)
      const isHit = Math.random() > 0.5;
      
      if (isHit) {
        setStats((prev) => {
          const newHits = prev.hits + 1;
          const newTotal = newHits + prev.misses;
          const newAccuracy = (newHits / newTotal) * 100;
          const newStreak = currentStreak + 1;
          
          setCurrentStreak(newStreak);
          
          return {
            hits: newHits,
            misses: prev.misses,
            accuracy: newAccuracy,
            bestStreak: Math.max(prev.bestStreak, newStreak),
          };
        });
      } else {
        setStats((prev) => {
          const newTotal = prev.hits + prev.misses + 1;
          const newAccuracy = (prev.hits / newTotal) * 100;
          
          return {
            ...prev,
            misses: prev.misses + 1,
            accuracy: newAccuracy,
          };
        });
        setCurrentStreak(0);
      }
    }
  };

  const handleReload = () => {
    setPlayerAmmo(maxAmmo);
  };

  const handleJump = () => {
    // Jump logic would be implemented here
    console.log('Jump!');
  };

  const handleExit = () => {
    setLocation('/lobby');
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
        <div className="absolute top-0 left-0 right-0 p-4 pointer-events-auto">
          <div className="flex items-center justify-between">
            {/* Mode Title */}
            <div className="bg-black/70 backdrop-blur-md rounded-lg px-4 py-2 border border-green-500/50">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-green-400" />
                <span className="text-white font-bold">Modo Treinamento</span>
              </div>
            </div>

            {/* Timer */}
            <div className="bg-black/70 backdrop-blur-md rounded-lg px-4 py-2 border border-white/20 text-white font-bold">
              {formatTime(trainingTime)}
            </div>

            {/* Exit Button */}
            <Button
              onClick={handleExit}
              variant="outline"
              size="sm"
              className="bg-black/70 hover:bg-red-500/20 backdrop-blur-md border-red-500/50 text-white gap-2"
            >
              <X className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </div>

        {/* Stats Panel (Top Right) */}
        <div className="absolute top-20 right-4 bg-black/70 backdrop-blur-md rounded-lg p-4 border border-white/20 space-y-3 pointer-events-auto">
          <div className="flex items-center gap-2 text-white font-bold mb-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span>Estatísticas</span>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Acertos:</span>
              <span className="text-green-400 font-bold">{stats.hits}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Erros:</span>
              <span className="text-red-400 font-bold">{stats.misses}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Precisão:</span>
              <span className="text-blue-400 font-bold">{stats.accuracy.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Sequência:</span>
              <span className="text-yellow-400 font-bold">{currentStreak}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Melhor:</span>
              <span className="text-purple-400 font-bold">{stats.bestStreak}</span>
            </div>
          </div>
        </div>

        {/* Center Crosshair */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-8 h-8 border-2 border-green-400/70 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-green-400 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute top-1/2 left-0 w-4 h-0.5 bg-green-400/50 transform -translate-y-1/2"></div>
          <div className="absolute top-1/2 right-0 w-4 h-0.5 bg-green-400/50 transform -translate-y-1/2"></div>
          <div className="absolute top-0 left-1/2 h-4 w-0.5 bg-green-400/50 transform -translate-x-1/2"></div>
          <div className="absolute bottom-0 left-1/2 h-4 w-0.5 bg-green-400/50 transform -translate-x-1/2"></div>
        </div>

        {/* Bottom HUD */}
        <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md rounded-lg px-4 py-3 border border-white/20 space-y-2 pointer-events-auto">
          {/* Health */}
          <div>
            <div className="text-white font-bold text-xs mb-1">VIDA</div>
            <div className="w-32 h-3 bg-black/50 rounded-full overflow-hidden border border-green-500/50">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all"
                style={{ width: `${playerHealth}%` }}
              />
            </div>
          </div>

          {/* Ammo */}
          <div>
            <div className="text-white font-bold text-xs mb-1">MUNIÇÃO</div>
            <div className="text-yellow-400 font-bold text-lg">{playerAmmo}/{maxAmmo}</div>
          </div>
        </div>

        {/* Instructions (Desktop only) */}
        {!isMobile && (
          <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md rounded-lg p-4 border border-white/20 text-xs text-slate-300 space-y-1 pointer-events-auto">
            <div><span className="text-white font-bold">WASD</span> - Mover</div>
            <div><span className="text-white font-bold">Mouse</span> - Olhar</div>
            <div><span className="text-white font-bold">Click</span> - Atirar</div>
            <div><span className="text-white font-bold">R</span> - Recarregar</div>
            <div><span className="text-white font-bold">Espaço</span> - Pular</div>
            <div><span className="text-white font-bold">ESC</span> - Sair</div>
          </div>
        )}
      </div>

      {/* Virtual Controls (Mobile only) */}
      {isMobile && (
        <VirtualJoystick
          onMove={handleMove}
          onShoot={handleShoot}
          onReload={handleReload}
          onJump={handleJump}
        />
      )}
    </div>
  );
}
