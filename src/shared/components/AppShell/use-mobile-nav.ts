"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useDisclosure } from "@mantine/hooks";

export function useMobileNav() {
  const pathname = usePathname();
  const [opened, { toggle, close }] = useDisclosure(false);

  useEffect(() => {
    close();
  }, [pathname, close]);

  return { opened, toggle, close };
}
