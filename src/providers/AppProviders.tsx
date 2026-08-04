"use client";

import { MantineProvider } from "@mantine/core";
import { DatesProvider } from "@mantine/dates";
import { Notifications } from "@mantine/notifications";
import "dayjs/locale/vi";
import { capraCareTheme } from "@/lib/theme/capracare-theme";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <MantineProvider theme={capraCareTheme} forceColorScheme="light">
      <DatesProvider settings={{ locale: "vi", firstDayOfWeek: 1 }}>
        <Notifications position="top-right" zIndex={1000} />
        {children}
      </DatesProvider>
    </MantineProvider>
  );
}
