"use client";

import { useState, type MouseEvent } from "react";
import { ActionIcon, Tooltip } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconHeart, IconHeartFilled } from "@tabler/icons-react";
import Link from "next/link";
import { toggleHandbookFavoriteAction } from "../actions/handbook-favorite.actions";
import styles from "./HandbookFavoriteButton.module.css";

type HandbookFavoriteButtonProps = {
  articleId: string;
  initialFavorited: boolean;
  isGuest: boolean;
  size?: "sm" | "md" | "lg";
  stopPropagation?: boolean;
  onToggle?: (articleId: string, favorited: boolean) => void;
};

export function HandbookFavoriteButton({
  articleId,
  initialFavorited,
  isGuest,
  size = "md",
  stopPropagation = false,
  onToggle,
}: HandbookFavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [pending, setPending] = useState(false);

  const handleClick = (event: MouseEvent) => {
    if (stopPropagation) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (isGuest) {
      notifications.show({
        color: "blue",
        message: (
          <>
            <Link href="/login" style={{ color: "inherit", fontWeight: 600 }}>
              Đăng nhập
            </Link>{" "}
            để lưu bài yêu thích và đọc lại sau.
          </>
        ),
      });
      return;
    }

    void (async () => {
      setPending(true);
      try {
        const result = await toggleHandbookFavoriteAction({ articleId });
        if (!result.ok) {
          notifications.show({ color: "red", message: result.message });
          return;
        }
        setFavorited(result.data.favorited);
        onToggle?.(articleId, result.data.favorited);
        notifications.show({
          color: "green",
          message: result.data.favorited ? "Đã thêm vào yêu thích" : "Đã bỏ yêu thích",
        });
      } finally {
        setPending(false);
      }
    })();
  };

  const label = favorited ? "Bỏ yêu thích" : "Thêm vào yêu thích";

  return (
    <Tooltip label={isGuest ? "Đăng nhập để lưu yêu thích" : label}>
      <ActionIcon
        variant={favorited ? "filled" : "light"}
        color="red"
        size={size}
        aria-label={label}
        aria-pressed={favorited}
        loading={pending}
        className={styles.button}
        onClick={handleClick}
      >
        {favorited ? <IconHeartFilled size={18} /> : <IconHeart size={18} stroke={1.5} />}
      </ActionIcon>
    </Tooltip>
  );
}
