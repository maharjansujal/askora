import { Clock, File, LogOut, LucideIcon, PowerOff, User } from "lucide-react";
import { IconType } from "react-icons";
import { RiDashboard3Line } from "react-icons/ri";

type NavItem = {
  label: string;
  href?: string;
  category: string;
  count?: number;
  icon?: LucideIcon | IconType;
  isLogout?: boolean;
};

export const navItems: NavItem[] = [
  {
    label: "Home",
    href: "/dashboard",
    category: "Discover",
    icon: RiDashboard3Line,
  },
  {
    label: "Recent",
    href: "/admin/recent",
    category: "Discover",
    icon: Clock,
  },
  {
    label: "Unanswered",
    href: "/admin/unanswered",
    category: "Discover",
    icon: PowerOff,
  },
  {
    label: "My Questions",
    href: "/admin/my-questions",
    category: "Discover",
    icon: File,
  },
  {
    label: "Logout",
    href: "/login",
    category: "Platform",
    icon: LogOut,
    isLogout: true,
  },
];
