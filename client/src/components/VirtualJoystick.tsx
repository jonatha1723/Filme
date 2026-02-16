import { useEffect, useRef, useState } from 'react';

interface JoystickState {
  x: number;
  y: number;
  isActive: boolean;
}

interface VirtualJoystickProps {
  onMove: (x: number, y: number) => void;
  onShoot: () => void;
  size?: number;
}

export default function VirtualJoystick({ onMove, onShoot, size = 100 }: VirtualJoystickProps) {
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
    <div className="fixed bottom-20 left-4 z-40">
      {/* Movement Joystick */}
      <div
        ref={containerRef}
        className="relative bg-white/10 backdrop-blur-md rounded-full border-2 border-white/20"
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

      {/* Shoot Button */}
      <button
        onClick={onShoot}
        className="fixed bottom-20 right-4 w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-700 text-white font-bold text-2xl shadow-lg active:scale-95 transition-transform z-40 flex items-center justify-center"
      >
        🔫
      </button>

      {/* Action Buttons */}
      <div className="fixed bottom-4 right-4 flex gap-2 z-40">
        {/* Reload */}
        <button className="w-12 h-12 rounded-lg bg-yellow-500/80 hover:bg-yellow-600 text-white font-bold text-xs transition-colors flex items-center justify-center">
          R
        </button>

        {/* Jump */}
        <button className="w-12 h-12 rounded-lg bg-green-500/80 hover:bg-green-600 text-white font-bold text-xs transition-colors flex items-center justify-center">
          ⬆️
        </button>
      </div>
    </div>
  );
}
