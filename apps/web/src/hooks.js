import { useState, useEffect, useRef } from "react";

/* Tracks a media query and re-renders on change. */
export function useMediaQuery(query) {
  const [match, setMatch] = useState(
    typeof window !== "undefined" ? window.matchMedia(query).matches : false
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return match;
}

/*
  Dialog focus management. When `active`, moves focus into the returned ref's
  element and traps Tab inside it. Escape handling is centralised by the caller.
  Depends only on `active`, so it won't steal focus on unrelated re-renders.
*/
export function useDialog(active) {
  const ref = useRef(null);
  useEffect(() => {
    if (!active) return;
    const node = ref.current;
    if (!node) return;
    const focusables = () =>
      Array.from(node.querySelectorAll('button,input,select,textarea,a[href],[tabindex]:not([tabindex="-1"])'))
        .filter((el) => !el.disabled && el.offsetParent !== null);
    const fs = focusables();
    (fs[0] || node).focus();
    const onKey = (e) => {
      if (e.key !== "Tab") return;
      const els = focusables();
      if (!els.length) return;
      const first = els[0], last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    node.addEventListener("keydown", onKey);
    return () => node.removeEventListener("keydown", onKey);
  }, [active]);
  return ref;
}
