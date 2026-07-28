"use client";

import styles from "./AppLayoutShell.module.css";

type MobileNavBackdropProps = {
  opened: boolean;
  onClose: () => void;
};

export function MobileNavBackdrop({ opened, onClose }: MobileNavBackdropProps) {
  if (!opened) {
    return null;
  }

  return (
    <button
      type="button"
      className={styles.mobileBackdrop}
      aria-label="Đóng menu"
      onClick={onClose}
    />
  );
}
