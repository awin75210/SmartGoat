import { Skeleton, Stack } from "@mantine/core";
import styles from "./LoadingSkeleton.module.css";

type LoadingSkeletonProps = {
  rows?: number;
  withHeader?: boolean;
};

export function LoadingSkeleton({ rows = 4, withHeader = true }: LoadingSkeletonProps) {
  return (
    <Stack gap="md" className={styles.root}>
      {withHeader ? (
        <>
          <Skeleton height={28} width="40%" radius="md" />
          <Skeleton height={14} width="60%" radius="md" />
        </>
      ) : null}
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} height={48} radius="md" />
      ))}
    </Stack>
  );
}
