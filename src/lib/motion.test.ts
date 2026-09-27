import { createElement } from "react";
import { renderToReadableStream } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  createVisibilityRegistry,
  isMotionSupported,
  motionState,
} from "./motion";
import { MotionGate } from "@/components/motion-gate";

describe("motionState", () => {
  it("returns 'done' when reduced motion is requested", () => {
    expect(
      motionState({
        seen: true,
        visible: true,
        tabVisible: true,
        reduced: true,
        supported: true,
        once: false,
        finished: false,
      }),
    ).toBe("done");
  });

  it("returns 'done' when JavaScript is not supported", () => {
    expect(
      motionState({
        seen: true,
        visible: true,
        tabVisible: true,
        reduced: false,
        supported: false,
        once: false,
        finished: false,
      }),
    ).toBe("done");
  });

  it("returns 'paused' when element is off screen", () => {
    expect(
      motionState({
        seen: true,
        visible: false,
        tabVisible: true,
        reduced: false,
        supported: true,
        once: false,
        finished: false,
      }),
    ).toBe("paused");
  });

  it("returns 'paused' when tab is not visible", () => {
    expect(
      motionState({
        seen: true,
        visible: true,
        tabVisible: false,
        reduced: false,
        supported: true,
        once: false,
        finished: false,
      }),
    ).toBe("paused");
  });

  it("returns 'running' when all conditions are met for animation", () => {
    expect(
      motionState({
        seen: true,
        visible: true,
        tabVisible: true,
        reduced: false,
        supported: true,
        once: false,
        finished: false,
      }),
    ).toBe("running");
  });

  it("returns 'done' when once mode and animation has finished", () => {
    expect(
      motionState({
        seen: true,
        visible: true,
        tabVisible: true,
        reduced: false,
        supported: true,
        once: true,
        finished: true,
      }),
    ).toBe("done");
  });

  it("returns 'running' when once mode but animation has not finished yet", () => {
    expect(
      motionState({
        seen: true,
        visible: true,
        tabVisible: true,
        reduced: false,
        supported: true,
        once: true,
        finished: false,
      }),
    ).toBe("running");
  });

  it("returns 'done' when reduced motion is flipped on while running", () => {
    expect(
      motionState({
        seen: true,
        visible: true,
        tabVisible: true,
        reduced: true,
        supported: true,
        once: false,
        finished: false,
      }),
    ).toBe("done");
  });

  it("returns 'idle' as initial state when element has never been seen", () => {
    expect(
      motionState({
        seen: false,
        visible: false,
        tabVisible: true,
        reduced: false,
        supported: true,
        once: false,
        finished: false,
      }),
    ).toBe("idle");
  });
});

describe("isMotionSupported", () => {
  it("returns false when IntersectionObserver is not defined", () => {
    expect(isMotionSupported({})).toBe(false);
  });

  it("returns true when IntersectionObserver is defined", () => {
    expect(isMotionSupported({ IntersectionObserver: class {} })).toBe(true);
  });
});

describe("MotionGate component", () => {
  async function render(children = "content", props?: Record<string, unknown>) {
    const stream = await renderToReadableStream(
      createElement(MotionGate, props, children),
    );
    await stream.allReady;
    return new Response(stream).text();
  }

  it("server-renders with data-motion='done' without props", async () => {
    const html = await render();
    expect(html).toMatch(/data-motion="done"/);
  });

  it("server-renders with data-motion='done' with once prop", async () => {
    const html = await render("content", { once: true });
    expect(html).toMatch(/data-motion="done"/);
  });

  it("includes className in the rendered div", async () => {
    const html = await render("content", { className: "test-class" });
    expect(html).toMatch(/class="test-class"/);
  });

  it("includes children in the rendered div", async () => {
    const html = await render("test content");
    expect(html).toContain("test content");
  });
});

describe("createVisibilityRegistry", () => {
  // Fake observer for testing
  let lastObserverCallback: ((entries: Array<{ target: Element; isIntersecting: boolean }>) => void) | null =
    null;

  class FakeIntersectionObserver {
    private observedElements = new Set<Element>();
    private callback: ((entries: Array<{ target: Element; isIntersecting: boolean }>) => void) | null = null;
    static constructionCount = 0;
    static disconnectCount = 0;

    constructor(
      callback: (entries: Array<{ target: Element; isIntersecting: boolean }>) => void,
    ) {
      FakeIntersectionObserver.constructionCount++;
      this.callback = callback;
      lastObserverCallback = callback;
    }

    observe(element: Element): void {
      this.observedElements.add(element);
    }

    unobserve(element: Element): void {
      this.observedElements.delete(element);
    }

    disconnect(): void {
      FakeIntersectionObserver.disconnectCount++;
      this.observedElements.clear();
    }
  }

  it("calls all callbacks when batch of entries received", () => {
    FakeIntersectionObserver.constructionCount = 0;
    FakeIntersectionObserver.disconnectCount = 0;
    lastObserverCallback = null;
    const registry = createVisibilityRegistry(
      FakeIntersectionObserver as unknown as typeof IntersectionObserver,
    );

    const elem1 = {};
    const elem2 = {};
    const elem3 = {};
    const calls1: boolean[] = [];
    const calls2: boolean[] = [];
    const calls3: boolean[] = [];

    registry.register(elem1 as Element, (visible) => calls1.push(visible));
    registry.register(elem2 as Element, (visible) => calls2.push(visible));
    registry.register(elem3 as Element, (visible) => calls3.push(visible));

    // Simulate batch of entries
    if (lastObserverCallback) {
      (lastObserverCallback as (entries: Array<{ target: Element; isIntersecting: boolean }>) => void)([
        { target: elem1 as Element, isIntersecting: true },
        { target: elem2 as Element, isIntersecting: false },
        { target: elem3 as Element, isIntersecting: true },
      ]);
    }

    expect(calls1).toEqual([true]);
    expect(calls2).toEqual([false]);
    expect(calls3).toEqual([true]);
  });

  it("creates one observer for multiple registrations", () => {
    FakeIntersectionObserver.constructionCount = 0;
    FakeIntersectionObserver.disconnectCount = 0;
    const registry = createVisibilityRegistry(
      FakeIntersectionObserver as unknown as typeof IntersectionObserver,
    );

    registry.register({} as Element, () => {});
    registry.register({} as Element, () => {});
    registry.register({} as Element, () => {});

    expect(FakeIntersectionObserver.constructionCount).toBe(1);
  });

  it("disconnects when last element unregistered and creates new observer on next register", () => {
    FakeIntersectionObserver.constructionCount = 0;
    FakeIntersectionObserver.disconnectCount = 0;
    const registry = createVisibilityRegistry(
      FakeIntersectionObserver as unknown as typeof IntersectionObserver,
    );

    const elem1 = {} as Element;
    const elem2 = {} as Element;

    registry.register(elem1, () => {});
    registry.register(elem2, () => {});
    expect(FakeIntersectionObserver.constructionCount).toBe(1);

    registry.unregister(elem1);
    expect(FakeIntersectionObserver.disconnectCount).toBe(0);

    registry.unregister(elem2);
    expect(FakeIntersectionObserver.disconnectCount).toBe(1);

    registry.register({} as Element, () => {});
    expect(FakeIntersectionObserver.constructionCount).toBe(2);
  });

  it("ignores entry for unregistered element", () => {
    FakeIntersectionObserver.constructionCount = 0;
    FakeIntersectionObserver.disconnectCount = 0;
    lastObserverCallback = null;
    const registry = createVisibilityRegistry(
      FakeIntersectionObserver as unknown as typeof IntersectionObserver,
    );

    const elem1 = {};
    const unregisteredElem = {};
    const calls: boolean[] = [];

    registry.register(elem1 as Element, (visible) => calls.push(visible));

    // Simulate entries including one for unregistered element
    if (lastObserverCallback) {
      (lastObserverCallback as (entries: Array<{ target: Element; isIntersecting: boolean }>) => void)([
        { target: unregisteredElem as Element, isIntersecting: true },
        { target: elem1 as Element, isIntersecting: false },
      ]);
    }

    expect(calls).toEqual([false]);
  });
});
