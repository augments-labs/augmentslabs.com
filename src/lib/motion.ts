export type MotionState = "idle" | "running" | "paused" | "done";

export type VisibilityCallback = (isIntersecting: boolean) => void;

export interface VisibilityRegistry {
  register(element: Element, callback: VisibilityCallback): void;
  unregister(element: Element): void;
}

export interface MotionStateInput {
  seen: boolean;
  visible: boolean;
  tabVisible: boolean;
  reduced: boolean;
  supported: boolean;
  once: boolean;
  finished: boolean;
}

export function isMotionSupported(globalObj: unknown): boolean {
  return (
    typeof globalObj === "object" &&
    globalObj !== null &&
    typeof (globalObj as Record<string, unknown>).IntersectionObserver !==
      "undefined"
  );
}

export function createVisibilityRegistry(
  Observer: typeof IntersectionObserver,
): VisibilityRegistry {
  let observer: IntersectionObserver | null = null;
  const callbacks = new Map<Element, VisibilityCallback>();

  return {
    register(element: Element, callback: VisibilityCallback): void {
      callbacks.set(element, callback);

      if (!observer) {
        observer = new Observer(
          (entries) => {
            entries.forEach((entry) => {
              const cb = callbacks.get(entry.target);
              if (cb) {
                cb(entry.isIntersecting);
              }
            });
          },
          { threshold: 0 },
        );
      }

      observer.observe(element);
    },

    unregister(element: Element): void {
      callbacks.delete(element);
      if (observer) {
        observer.unobserve(element);
        if (callbacks.size === 0) {
          observer.disconnect();
          observer = null;
        }
      }
    },
  };
}

export function motionState(input: MotionStateInput): MotionState {
  // Reduced motion requested by user
  if (input.reduced) {
    return "done";
  }

  // JavaScript not supported, show finished state
  if (!input.supported) {
    return "done";
  }

  // Once mode and animation already finished, don't restart
  if (input.once && input.finished) {
    return "done";
  }

  // Element hasn't been seen yet
  if (!input.seen) {
    return "idle";
  }

  // Element is off screen
  if (!input.visible) {
    return "paused";
  }

  // Tab is hidden
  if (!input.tabVisible) {
    return "paused";
  }

  // All conditions met, animation can run
  return "running";
}
