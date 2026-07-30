import { createTheme, type MantineColorsTuple } from "@mantine/core";

/** Brand: #2382f6 (sáng) → #1559a2 (tối) */
const capraBlue: MantineColorsTuple = [
  "#eef5fe",
  "#d9eafd",
  "#b3d5fb",
  "#8cbff9",
  "#5ca3f7",
  "#2382f6",
  "#1d74e3",
  "#1559a2",
  "#124d88",
  "#0f4275",
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
  primaryColor: "capraBlue",
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
    brandLight: "#2382f6",
    brandDark: "#1559a2",
    pageBg: "#f4f9fd",
    cardRadius: "14px",
    sidebarWidth: 252,
  },
});
