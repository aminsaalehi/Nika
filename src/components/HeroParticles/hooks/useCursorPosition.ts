/**
 * useCursorPosition – Returns cursor position in NDC (-1 to 1) when over the container, null when outside.
 */

import { useCallback, useEffect, useRef, useState } from "react";

export function useCursorPosition(containerRef: React.RefObject<HTMLElement | null>) {
  const [ndc, setNdc] = useState<{ x: number; y: number } | null>(null);
  const isInside = useRef(false);

  const update = useCallback((clientX: number, clientY: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    if (width <= 0 || height <= 0) return;
    const x = (clientX - rect.left) / width;
    const y = (clientY - rect.top) / height;
    if (x >= 0 && x <= 1 && y >= 0 && y <= 1) {
      isInside.current = true;
      setNdc({ x: x * 2 - 1, y: -(y * 2 - 1) });
    }
  }, [containerRef]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onMove = (e: PointerEvent) => update(e.clientX, e.clientY);
    const onLeave = () => {
      isInside.current = false;
      setNdc(null);
    };

    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [containerRef, update]);

  return ndc;
}
