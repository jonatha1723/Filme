import { useEffect, useRef, useState } from "react";

export interface GameInput {
  moveForward: boolean;
  moveBackward: boolean;
  moveLeft: boolean;
  moveRight: boolean;
  jump: boolean;
  shoot: boolean;
  reload: boolean;
  sprint: boolean;
  mouseX: number;
  mouseY: number;
  mouseDeltaX: number;
  mouseDeltaY: number;
}

export function useGameInput() {
  const [input, setInput] = useState<GameInput>({
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    jump: false,
    shoot: false,
    reload: false,
    sprint: false,
    mouseX: 0,
    mouseY: 0,
    mouseDeltaX: 0,
    mouseDeltaY: 0,
  });

  const lastMouseRef = useRef({ x: 0, y: 0 });
  const isLockedRef = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      setInput((prev) => {
        const newInput = { ...prev };
        
        switch (key) {
          case "w":
            newInput.moveForward = true;
            break;
          case "s":
            newInput.moveBackward = true;
            break;
          case "a":
            newInput.moveLeft = true;
            break;
          case "d":
            newInput.moveRight = true;
            break;
          case " ":
            e.preventDefault();
            newInput.jump = true;
            break;
          case "shift":
            newInput.sprint = true;
            break;
          case "r":
            newInput.reload = true;
            break;
        }
        
        return newInput;
      });
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      setInput((prev) => {
        const newInput = { ...prev };
        
        switch (key) {
          case "w":
            newInput.moveForward = false;
            break;
          case "s":
            newInput.moveBackward = false;
            break;
          case "a":
            newInput.moveLeft = false;
            break;
          case "d":
            newInput.moveRight = false;
            break;
          case " ":
            e.preventDefault();
            newInput.jump = false;
            break;
          case "shift":
            newInput.sprint = false;
            break;
          case "r":
            newInput.reload = false;
            break;
        }
        
        return newInput;
      });
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        setInput((prev) => ({ ...prev, shoot: true }));
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) {
        setInput((prev) => ({ ...prev, shoot: false }));
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.movementX || 0;
      const deltaY = e.movementY || 0;

      setInput((prev) => ({
        ...prev,
        mouseX: e.clientX,
        mouseY: e.clientY,
        mouseDeltaX: deltaX,
        mouseDeltaY: deltaY,
      }));

      lastMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleClick = () => {
      if (document.pointerLockElement === null) {
        document.documentElement.requestPointerLock?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
    };
  }, []);

  return input;
}
