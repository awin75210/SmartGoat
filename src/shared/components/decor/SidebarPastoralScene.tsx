import styles from "./SidebarPastoralScene.module.css";

export function SidebarPastoralScene() {
  return (
    <div className={styles.scene} aria-hidden>
      <div className={styles.sky} />
      <div className={styles.hills} />
      <div className={styles.barn} />
      <div className={`${styles.goat} ${styles.goatLeft}`} />
      <div className={`${styles.goat} ${styles.goatRight}`} />
    </div>
  );
}
