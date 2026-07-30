import {
  IconBell,
  IconBook,
  IconChartBar,
  IconDeviceAnalytics,
  IconHome,
  IconMessageChatbot,
  IconSettings,
  IconUsers,
  IconBuilding,
  IconUserCog,
} from "@tabler/icons-react";

export type AppNavItem = {
  label: string;
  href: string;
  icon: typeof IconHome;
};

export const FARM_NAV_ITEMS: AppNavItem[] = [
  { label: "Trang chủ", href: "/app", icon: IconHome },
  { label: "Giám sát IoT", href: "/app/iot", icon: IconDeviceAnalytics },
  { label: "Trợ lý AI", href: "/app/ai-assistant", icon: IconMessageChatbot },
  { label: "Sổ tay điện tử", href: "/app/handbook", icon: IconBook },
  { label: "Đàn dê", href: "/app/herd", icon: IconUsers },
  { label: "Cảnh báo", href: "/app/alerts", icon: IconBell },
  { label: "Báo cáo", href: "/app/reports", icon: IconChartBar },
  { label: "Cài đặt", href: "/app/settings", icon: IconSettings },
];

export const ADMIN_NAV_ITEMS: AppNavItem[] = [
  { label: "Tổng quan", href: "/admin", icon: IconHome },
  { label: "Trang trại", href: "/admin/farms", icon: IconBuilding },
  { label: "Người dùng", href: "/admin/users", icon: IconUserCog },
  { label: "Kiến thức AI", href: "/admin/knowledge", icon: IconMessageChatbot },
];
