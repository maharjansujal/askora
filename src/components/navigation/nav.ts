import { LucideIcon } from "lucide-react";
import { IconType } from "react-icons";

export type NavItem = {
  label: string;
  href?: string;
  count?: number;
  icon?: LucideIcon | IconType;
  isLogout?: boolean;
};

export type NavGroup = {
  category: string;
  items: NavItem[];
};

export const userNavItems: NavGroup[] = [
  {
    category: "Feed",
    items: [
      {
        label: "Home",
        href: "/dashboard",
        // icon: Home,
      },
      {
        label: "Recent",
        href: "/recent",
        // icon: Clock3,
      },
      {
        label: "Bookmarks",
        href: "/bookmarks",
        // icon: Bookmark,
      },
    ],
  },
  {
    category: "Yours",
    items: [
      {
        label: "Profile",
        href: "/profile",
        // icon: User,
      },
      {
        label: "My questions",
        href: "/my-questions",
        // icon: HelpCircle,
      },
      {
        label: "My answers",
        href: "/my-answers",
        // icon: MessageCircle,
      },
      {
        label: "Bookmarked",
        href: "/bookmarks",
        // icon: Bookmark,
      },
    ],
  },
];

export const adminNavItems: NavGroup[] = [
  {
    category: "Discover",
    items: [
      {
        label: "Dashboard",
        href: "/admin/dashboard",
        // icon: LayoutDashboard,
      },
    ],
  },
  {
    category: "Overview",
    items: [
      {
        label: "User Management",
        href: "/admin/user-management",
        // icon: Users,
      },
      {
        label: "Moderators",
        href: "/admin/moderators",
        // icon: ShieldCheck,
      },
    ],
  },
  {
    category: "Content",
    items: [
      {
        label: "All questions",
        href: "/admin/all-questions",
        // icon: FileText,
      },
      {
        label: "Flagged Content",
        href: "/admin/flagged-content",
        // icon: Flag,
      },
      {
        label: "Categories",
        href: "/admin/categories",
        // icon: Tags,
      },
      {
        label: "Subjects",
        href: "/admin/subjects",
        // icon: BookOpen,
      },
    ],
  },
  {
    category: "Platform",
    items: [
      {
        label: "Analytics",
        href: "/admin/analytics",
        // icon: BarChart3,
      },
      {
        label: "Site Settings",
        href: "/admin/site-settings",
        // icon: Settings,
      },
    ],
  },
];
