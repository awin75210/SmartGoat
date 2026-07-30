"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { IconArrowLeft } from "@tabler/icons-react";
import styles from "./HandbookArticleBackLink.module.css";

const DESKTOP_MQ = "(min-width: 992px)";
const FIXED_TOP = "calc(60px + 0.75rem)";

export function HandbookArticleBackLink() {
  const anchorRef = useRef<HTMLDivElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_MQ);

    const updatePosition = () => {
      const anchor = anchorRef.current;
      const link = linkRef.current;
      const isDesktop = media.matches;
      setPinned(isDesktop);

      if (!anchor || !link || !isDesktop) return;

      const rect = anchor.getBoundingClientRect();
      link.style.left = `${rect.left}px`;
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
    <div className={styles.wrap}>
      <div ref={anchorRef} className={styles.anchor} aria-hidden />
      <Link
        ref={linkRef}
        href="/app/handbook"
        className={pinned ? `${styles.link} ${styles.linkFixed}` : styles.link}
        style={pinned ? { top: FIXED_TOP } : undefined}
      >
        <IconArrowLeft size={16} stroke={1.5} />
        Quay lại sổ tay
      </Link>
    </div>
  );
}
