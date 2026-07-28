import { Badge } from "@mantine/core";
import styles from "./StatusBadge.module.css";

type StatusBadgeProps = {
  label: string;
  color?: string;
  variant?: "filled" | "light" | "outline";
};

export function StatusBadge({
  label,
  color = "#228be6",
  variant = "light",
}: StatusBadgeProps) {
  return (
    <Badge
      variant={variant}
      className={styles.badge}
      styles={{
        root: {
          borderColor: variant === "outline" ? color : undefined,
          color: variant === "light" ? color : undefined,
          backgroundColor: variant === "light" ? `${color}22` : undefined,
        },
      }}
    >
      {label}
    </Badge>
  );
}
