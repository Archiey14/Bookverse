import { useEffect } from "react";

// Stops the page behind a modal / side panel from scrolling.
export function useScrollLock(locked) {
  useEffect(() => {
    if (!locked) return;

    const root = document.documentElement;
    const previous = {
      rootOverflow: root.style.overflow,
      bodyOverflow: document.body.style.overflow,
      bodyPaddingRight: document.body.style.paddingRight,
    };

    // Reserve the scrollbar's width so the page doesn't jump sideways
    const scrollbarWidth = window.innerWidth - root.clientWidth;

    root.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      root.style.overflow = previous.rootOverflow;
      document.body.style.overflow = previous.bodyOverflow;
      document.body.style.paddingRight = previous.bodyPaddingRight;
    };
  }, [locked]);
}
