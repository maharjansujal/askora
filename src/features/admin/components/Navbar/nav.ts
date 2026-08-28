import { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Flag,
  FolderTree,
  LayoutDashboard,
  MessageSquare,
  Settings,
  ShieldCheck,
  Tags,
  Users,
} from "lucide-react";
import { IconType } from "react-icons";

type NavItem = {
  label: string;
  href: string;
  category: string;
  count?: number;
  icon?: LucideIcon | IconType;
};

export const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    category: "Discover",
    icon: LayoutDashboard,
  },
  {
    label: "User Management",
    href: "/admin/user-management",
    category: "Overview",
    icon: Users,
  },
  {
    label: "Moderators",
    href: "/admin/moderators",
    category: "Overview",
    icon: ShieldCheck,
  },
  {
    label: "All questions",
    href: "/admin/all-questions",
    category: "Content",
    icon: MessageSquare,
  },
  {
    label: "Flagged Content",
    href: "/admin/flagged-content",
    category: "Content",
    icon: Flag,
  },
  {
    label: "Tags & Categories",
    href: "/admin/tags-and-categories",
    category: "Content",
    icon: Tags,
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    category: "Platform",
    icon: BarChart3,
  },
  {
    label: "Site Settings",
    href: "/admin/site-settings",
    category: "Platform",
    icon: Settings,
  },
];
