"use client";

import Link from "next/link";
import { type CSSProperties } from "react";
import { Paper, Stack, Text, Title, UnstyledButton } from "@mantine/core";
import { IconList, IconLink } from "@tabler/icons-react";
import { HANDBOOK_CATEGORY_META, type HandbookArticle } from "../types/handbook.types";
import type { HandbookTocEntry } from "../utils/handbook-sidebar.utils";
import styles from "./HandbookArticleSidebar.module.css";

type HandbookArticleSidebarProps = {
  toc: HandbookTocEntry[];
  relatedArticles: HandbookArticle[];
  accent: string;
};

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export function HandbookArticleSidebar({ toc, relatedArticles, accent }: HandbookArticleSidebarProps) {
  return (
    <aside className={styles.sidebar} style={{ "--category-accent": accent } as CSSProperties}>
      <Paper withBorder radius="md" p="md" className={styles.panel}>
        <Stack gap="xs" mb="sm">
          <Text size="xs" fw={700} tt="uppercase" c="dimmed" className={styles.panelLabel}>
            <IconList size={14} stroke={1.5} className={styles.panelIcon} />
            Phụ lục
          </Text>
          <Title order={6} className={styles.panelTitle}>
            Mục lục bài viết
          </Title>
        </Stack>
        <nav aria-label="Mục lục bài viết">
          <Stack gap={4}>
            {toc.map((entry) => (
              <UnstyledButton
                key={entry.id}
                className={styles.tocLink}
                onClick={() => scrollToSection(entry.id)}
              >
                {entry.label}
              </UnstyledButton>
            ))}
          </Stack>
        </nav>
      </Paper>

      {relatedArticles.length > 0 ? (
        <Paper withBorder radius="md" p="md" className={styles.panel} mt="md">
          <Stack gap="xs" mb="sm">
            <Text size="xs" fw={700} tt="uppercase" c="dimmed" className={styles.panelLabel}>
              <IconLink size={14} stroke={1.5} className={styles.panelIcon} />
              Liên quan
            </Text>
            <Title order={6} className={styles.panelTitle}>
              Bài viết gợi ý
            </Title>
          </Stack>
          <Stack gap={6}>
            {relatedArticles.map((related) => {
              const meta = HANDBOOK_CATEGORY_META[related.category];
              return (
                <Link key={related.id} href={`/app/handbook/${related.id}`} className={styles.relatedLink}>
                  <Text size="sm" fw={600} lineClamp={2} className={styles.relatedTitle}>
                    {related.title}
                  </Text>
                  <Text size="xs" c="dimmed" lineClamp={1}>
                    {meta.label}
                  </Text>
                </Link>
              );
            })}
          </Stack>
        </Paper>
      ) : null}
    </aside>
  );
}
