"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./HandbookArticleSidebarColumn.module.css";

const DESKTOP_MQ = "(min-width: 992px)";
const HEADER_OFFSET = "calc(60px + 1.25rem)";

type HandbookArticleSidebarColumnProps = {
  children: ReactNode;
};

export function HandbookArticleSidebarColumn({ children }: HandbookArticleSidebarColumnProps) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const fixedRef = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_MQ);

    const updatePosition = () => {
      const anchor = anchorRef.current;
      const fixed = fixedRef.current;
      const isDesktop = media.matches;
      setPinned(isDesktop);

      if (!anchor || !fixed || !isDesktop) return;

      const rect = anchor.getBoundingClientRect();
      fixed.style.left = `${rect.left}px`;
      fixed.style.width = `${rect.width}px`;
    };

    updatePosition();
    const frame = requestAnimationFrame(updatePosition);

    media.addEventListener("change", updatePosition);
    window.addEventListener("resize", updatePosition);

    const anchor = anchorRef.current;
    const resizeObserver = new ResizeObserver(updatePosition);
    if (anchor) resizeObserver.observe(anchor);

    return () => {
      cancelAnimationFrame(frame);
      media.removeEventListener("change", updatePosition);
      window.removeEventListener("resize", updatePosition);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div ref={anchorRef} className={styles.anchor}>
      <div
        ref={fixedRef}
        className={pinned ? styles.fixed : styles.flow}
        style={pinned ? { top: HEADER_OFFSET } : undefined}
      >
        {children}
      </div>
    </div>
  );
}
