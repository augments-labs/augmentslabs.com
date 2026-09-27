"use client";

import {
  ReactNode,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  createVisibilityRegistry,
  isMotionSupported,
  motionState,
  type VisibilityRegistry,
} from "@/lib/motion";

interface MotionGateProps {
  children?: ReactNode;
  once?: boolean;
  className?: string;
}

// Module-level registry, one per page
let visibilityRegistry: VisibilityRegistry | null = null;

function getOrCreateRegistry(): VisibilityRegistry {
  if (!visibilityRegistry) {
    visibilityRegistry = createVisibilityRegistry(IntersectionObserver);
  }
  return visibilityRegistry;
}

// Subscribe functions for useSyncExternalStore
const subscribeNever = () => () => {};

function subscribeReduced(onChange: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function subscribeTab(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

export function MotionGate({
  children,
  once = false,
  className,
}: MotionGateProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [finished, setFinished] = useState(false);

  // Use useSyncExternalStore for values that differ between server and client
  const mounted = useSyncExternalStore(subscribeNever, () => true, () => false);
  const reduced = useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
  const tabVisible = useSyncExternalStore(
    subscribeTab,
    () => !document.hidden,
    () => true,
  );

  const supported = mounted && isMotionSupported(window);

  const state = mounted
    ? motionState({
        seen,
        visible,
        tabVisible,
        reduced,
        supported,
        once,
        finished,
      })
    : "done";

  // Register with visibility registry
  useLayoutEffect(() => {
    const element = containerRef.current;
    if (!element || !supported) return;

    const registry = getOrCreateRegistry();
    registry.register(element, (isIntersecting) => {
      setSeen((prev) => prev || isIntersecting);
      setVisible(isIntersecting);
    });

    return () => {
      registry.unregister(element);
    };
  }, [supported]);

  // Listen for animation end in once mode
  useLayoutEffect(() => {
    const element = containerRef.current;
    if (!element || !once) return;

    const handleAnimationEnd = () => {
      if (once) {
        const animations = (element.getAnimations?.({ subtree: true }) ?? []) as Array<{ playState: string }>;
        const hasRunningAnimation = animations.some(
          (anim) => anim.playState === "running",
        );
        if (!hasRunningAnimation) {
          setFinished(true);
        }
      }
    };

    element.addEventListener("animationend", handleAnimationEnd);

    return () => {
      element.removeEventListener("animationend", handleAnimationEnd);
    };
  }, [once]);

  return (
    <div
      ref={containerRef}
      className={className}
      data-motion={state}
    >
      {children}
    </div>
  );
}
