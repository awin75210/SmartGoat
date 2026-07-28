import { createTheme, type MantineColorsTuple } from "@mantine/core";

const capraBlue: MantineColorsTuple = [
  "#e8f4fc",
  "#d0e8f9",
  "#a1d1f3",
  "#6fb8ec",
  "#45a2e6",
  "#2d94e3",
  "#1f8de2",
  "#1079c9",
  "#006bb5",
  "#005ca0",
];

const capraGreen: MantineColorsTuple = [
  "#eefbf3",
  "#d8f5e4",
  "#b3ebc9",
  "#8ae0ab",
  "#68d792",
  "#52d081",
  "#43cd78",
  "#32b565",
  "#28a158",
  "#1e8b49",
];

export const capraCareTheme = createTheme({
  primaryColor: "capraGreen",
  colors: {
    capraBlue,
    capraGreen,
  },
  fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
  headings: {
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
    fontWeight: "700",
  },
  defaultRadius: "md",
  other: {
    navyTitle: "#1a3a5c",
    pageBg: "#f4f9fd",
    cardRadius: "14px",
    sidebarWidth: 252,
  },
});
