import { useCallback, useEffect, useState } from "react";

// Powers the left/right arrows on any horizontally scrolling row.
//
//   const ref = useRef(null);
//   const { canPrev, canNext, scroll } = useScrollArrows(ref, items.length);
//   <div ref={ref} style={{ overflowX: "auto" }}> ... </div>
//   <button disabled={!canPrev} onClick={() => scroll(-1)}>
//
// `dependency` is anything that changes when the row's content changes, so the
// arrows re-check whether there is more to scroll to.
export function useScrollArrows(ref, dependency) {
  const [state, setState] = useState({ canPrev: false, canNext: false });

  const update = useCallback(() => {
    const element = ref.current;
    if (!element) return;

    const canPrev = element.scrollLeft > 4;
    const canNext =
      element.scrollLeft + element.clientWidth < element.scrollWidth - 4;

    setState((current) =>
      current.canPrev === canPrev && current.canNext === canNext
        ? current
        : { canPrev, canNext },
    );
  }, [ref]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    const frame = window.requestAnimationFrame(update);
    element.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.cancelAnimationFrame(frame);
      element.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [ref, update, dependency]);

  const scroll = useCallback(
    (direction) => {
      const element = ref.current;
      if (!element) return;

      element.scrollBy({
        left: direction * element.clientWidth * 0.85,
        behavior: "smooth",
      });
    },
    [ref],
  );

  return { ...state, scroll };
}
