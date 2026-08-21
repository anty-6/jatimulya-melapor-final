"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function TopLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevPath = useRef(pathname + searchParams.toString());

  // Intercept link clicks to start the bar
  useEffect(() => {
    function startProgress() {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (hideRef.current) clearTimeout(hideRef.current);
      setVisible(true);
      setWidth(15);
      let w = 15;
      intervalRef.current = setInterval(() => {
        // Ease toward 85% but never reach it until navigation completes
        w = Math.min(85, w + (85 - w) * 0.12);
        setWidth(w);
      }, 150);
    }

    function handleClick(e: MouseEvent) {
      const anchor = (e.target as Element).closest("a");
      if (
        !anchor ||
        !anchor.href ||
        anchor.target === "_blank" ||
        anchor.download ||
        e.metaKey ||
        e.ctrlKey
      )
        return;
      try {
        const url = new URL(anchor.href);
        if (url.origin !== window.location.origin) return;
        const next = url.pathname + url.search;
        if (next === prevPath.current) return;
      } catch {
        return;
      }
      startProgress();
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // Complete when pathname / searchParams change
  useEffect(() => {
    const current = pathname + searchParams.toString();
    if (current === prevPath.current) return;
    prevPath.current = current;

    if (intervalRef.current) clearInterval(intervalRef.current);
    setWidth(100);
    hideRef.current = setTimeout(() => {
      setVisible(false);
      setWidth(0);
    }, 350);
  }, [pathname, searchParams]);

  if (!visible && width === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "3px",
        width: `${width}%`,
        backgroundColor: "#0c3a54",
        zIndex: 9999,
        transition:
          width === 100
            ? "width 0.15s ease"
            : "width 0.15s ease",
        borderRadius: "0 2px 2px 0",
        boxShadow: "0 0 8px rgba(12,58,84,0.5)",
      }}
    />
  );
}
