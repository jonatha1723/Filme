import { useEffect, useRef, useState } from 'react';

interface JoystickState {
  x: number;
  y: number;
  isActive: boolean;
}

interface VirtualJoystickProps {
  onMove: (x: number, y: number) => void;
  onShoot: () => void;
  onReload?: () => void;
  onJump?: () => void;
  size?: number;
  shootButtonSize?: number;
}

export default function VirtualJoystick({ 
  onMove, 
  onShoot, 
  onReload, 
  onJump, 
  size = 120, 
  shootButtonSize = 80 
}: VirtualJoystickProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [joystickState, setJoystickState] = useState<JoystickState>({
    x: 0,
    y: 0,
    isActive: false,
  });

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!containerRef.current) return;

    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    setJoystickState({ ...joystickState, isActive: true });
    updateJoystick(touch.clientX - rect.left, touch.clientY - rect.top, centerX, centerY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current || !joystickState.isActive) return;

    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    updateJoystick(touch.clientX - rect.left, touch.clientY - rect.top, centerX, centerY);
  };

  const handleTouchEnd = () => {
    setJoystickState({ x: 0, y: 0, isActive: false });
    onMove(0, 0);
  };

  const updateJoystick = (touchX: number, touchY: number, centerX: number, centerY: number) => {
    const dx = touchX - centerX;
    const dy = touchY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDistance = size / 2 - 10;

    let x = dx;
    let y = dy;

    if (distance > maxDistance) {
      const angle = Math.atan2(dy, dx);
      x = Math.cos(angle) * maxDistance;
      y = Math.sin(angle) * maxDistance;
    }

    setJoystickState({
      x: x / maxDistance,
      y: y / maxDistance,
      isActive: true,
    });

    onMove(x / maxDistance, y / maxDistance);
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {/* Movement Joystick */}
      <div className="absolute bottom-8 left-6 pointer-events-auto">
        <div
          ref={containerRef}
          className="relative bg-white/10 backdrop-blur-md rounded-full border-2 border-white/20 shadow-xl"
          style={{ width: size, height: size }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
        {/* Joystick Knob */}
        <div
          className="absolute top-1/2 left-1/2 w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-lg transition-all"
          style={{
            transform: `translate(calc(-50% + ${joystickState.x * (size / 2 - 20)}px), calc(-50% + ${
              joystickState.y * (size / 2 - 20)
            }px))`,
          }}
        />

        {/* Direction Indicators */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-xs text-white/30 font-bold">MOVE</div>
        </div>
      </div>

      </div>

      {/* Shoot Button */}
      <div className="absolute bottom-8 right-6 pointer-events-auto">
        <button
          onTouchStart={(e) => { e.preventDefault(); onShoot(); }}
          className="rounded-full bg-gradient-to-br from-red-500 to-red-700 text-white font-bold text-3xl shadow-xl active:scale-95 transition-transform flex items-center justify-center"
          style={{ width: shootButtonSize, height: shootButtonSize }}
        >
          🔫
        </button>
      </div>

      {/* Action Buttons */}
      <div className="absolute bottom-8 right-6 flex flex-col gap-3 pointer-events-auto" style={{ marginRight: shootButtonSize + 16 }}>
        {/* Reload */}
        {onReload && (
          <button 
            onTouchStart={(e) => { e.preventDefault(); onReload(); }}
            className="w-14 h-14 rounded-xl bg-yellow-500/90 active:bg-yellow-600 text-white font-bold text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center"
          >
            R
          </button>
        )}

        {/* Jump */}
        {onJump && (
          <button 
            onTouchStart={(e) => { e.preventDefault(); onJump(); }}
            className="w-14 h-14 rounded-xl bg-green-500/90 active:bg-green-600 text-white font-bold text-xl shadow-lg active:scale-95 transition-all flex items-center justify-center"
          >
            ⬆️
          </button>
        )}
      </div>
    </div>
  );
}
