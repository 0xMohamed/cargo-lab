import { onCleanup } from "solid-js";
import { createSignal, onMount } from "solid-js";

export function useMeasure() {
  const [rect, setRect] = createSignal<DOMRect | null>(null);
  let element: HTMLElement | null = null;

  const ref = (el: HTMLElement) => {
    element = el;
    updateRect();
  };

  const updateRect = () => {
    if (element) {
      setRect(element.getBoundingClientRect());
    }
  };

  onMount(() => {
    if (!element) return;

    const observer = new ResizeObserver(() => {
      updateRect();
    });

    observer.observe(element);
    onCleanup(() => observer.disconnect());
  });

  return [ref, rect] as const;
}
