type NavItem = {
  label: string;
  href: string;
  count?: number;
  isLogout?: boolean;
};

type NavSection = {
  category: string;
  items: NavItem[];
};

export const navItems: NavSection[] = [
  {
    category: "Feed",
    items: [
      { label: "Home", href: "/dashboard" },
      { label: "Recent", href: "/recent" },
      { label: "Bookmarks", href: "/bookmarks" },
    ],
  },
  {
    category: "Yours",
    items: [
      { label: "Profile", href: "/profile" },
      { label: "My questions", href: "/my-questions" },
      { label: "My answers", href: "/my-answers" },
      { label: "Bookmarked", href: "/bookmarks" },
    ],
  },
  {
    category: "Platform",
    items: [{ label: "Logout", href: "/login", isLogout: true }],
  },
];
