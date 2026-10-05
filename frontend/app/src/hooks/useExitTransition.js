import { useEffect, useState } from "react";

// Lets a pop-up animate out instead of vanishing.
//
// Pass the thing that controls the pop-up (e.g. the open panel name, or the
// selected book). While it is set, you get it back as normal. When it is
// cleared, the previous value stays on screen for `duration` ms and `closing`
// is true, so CSS can play the exit animation; after that it is cleared too.
//
//   const [panel, closing] = useExitTransition(panelProp);
//   if (!panel) return null;
//   <div className={closing ? "overlay closing" : "overlay"}> ...
//
// Keep `duration` the same as the CSS exit animation (0.28s in App.css).
export function useExitTransition(value, duration = 280) {
  const [rendered, setRendered] = useState(value);

  // Remember the latest open value so it can stay visible while closing
  if (value && value !== rendered) {
    setRendered(value);
  }

  useEffect(() => {
    if (value) return undefined;

    const reduceMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const timer = window.setTimeout(
      () => setRendered(value),
      reduceMotion ? 0 : duration,
    );

    return () => window.clearTimeout(timer);
  }, [value, duration]);

  return [value || rendered, !value && Boolean(rendered)];
}
