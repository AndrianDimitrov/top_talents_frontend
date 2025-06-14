import { useState, useCallback, useRef, useEffect } from 'react';

interface AnimationConfig {
  tension?: number;
  friction?: number;
  mass?: number;
  initialVelocity?: number;
  restSpeed?: number;
  restDisplacement?: number;
}

interface AnimationState {
  value: number;
  velocity: number;
  isAnimating: boolean;
}

export function useAnimation(
  initialValue = 0,
  config: AnimationConfig = {}
) {
  const {
    tension = 170,
    friction = 26,
    mass = 1,
    initialVelocity = 0,
    restSpeed = 0.01,
    restDisplacement = 0.01,
  } = config;

  const [state, setState] = useState<AnimationState>({
    value: initialValue,
    velocity: initialVelocity,
    isAnimating: false,
  });

  const targetRef = useRef(initialValue);
  const frameRef = useRef<number>();
  const lastTimeRef = useRef<number>();

  const animate = useCallback(
    (target: number) => {
      targetRef.current = target;
      setState(prev => ({ ...prev, isAnimating: true }));
      lastTimeRef.current = performance.now();
      frameRef.current = requestAnimationFrame(update);
    },
    []
  );

  const update = useCallback(() => {
    const currentTime = performance.now();
    const deltaTime = (currentTime - (lastTimeRef.current || currentTime)) / 1000;
    lastTimeRef.current = currentTime;

    setState(prev => {
      const displacement = targetRef.current - prev.value;
      const spring = tension * displacement;
      const damper = friction * prev.velocity;
      const acceleration = (spring - damper) / mass;
      const newVelocity = prev.velocity + acceleration * deltaTime;
      const newValue = prev.value + newVelocity * deltaTime;

      const isAtRest =
        Math.abs(newVelocity) < restSpeed &&
        Math.abs(displacement) < restDisplacement;

      if (isAtRest) {
        cancelAnimationFrame(frameRef.current!);
        return {
          value: targetRef.current,
          velocity: 0,
          isAnimating: false,
        };
      }

      frameRef.current = requestAnimationFrame(update);
      return {
        value: newValue,
        velocity: newVelocity,
        isAnimating: true,
      };
    });
  }, [tension, friction, mass, restSpeed, restDisplacement]);

  const stop = useCallback(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      setState(prev => ({ ...prev, isAnimating: false }));
    }
  }, []);

  useEffect(() => {
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return {
    value: state.value,
    velocity: state.velocity,
    isAnimating: state.isAnimating,
    animate,
    stop,
  };
} 