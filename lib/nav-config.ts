import {
  Home,
  TreePine,
  BookOpen,
  MessageSquare,
  Newspaper,
  CreditCard,
  BarChart3,
  User,
  Shield,
  Settings,
  Users,
  FileText,
  Flag,
  AlertTriangle,
  Activity,
  Database,
  Bell,
  Heart,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

// ── Member / Moderator Navigation ─────────────────────────────────
export const memberNavSections: NavSection[] = [
  {
    title: "Main",
    items: [
      { href: "/home", label: "Dashboard", icon: Home },
      { href: "/family-tree", label: "Family Tree", icon: TreePine },
      { href: "/blog", label: "Blog", icon: BookOpen },
      { href: "/forum", label: "Forum", icon: MessageSquare },
      { href: "/news", label: "News", icon: Newspaper },
    ],
  },
  {
    title: "Account",
    items: [
      { href: "/payments", label: "Payments", icon: CreditCard },
      { href: "/profile", label: "My Profile", icon: User },
    ],
  },
];

// ── Admin Navigation ──────────────────────────────────────────────
export const adminNavSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      { href: "/home", label: "Dashboard", icon: Home },
      { href: "/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Content",
    items: [
      { href: "/blog", label: "Blog Posts", icon: BookOpen },
      { href: "/forum", label: "Forum", icon: MessageSquare },
      { href: "/news", label: "News", icon: Newspaper },
      { href: "/family-tree", label: "Family Tree", icon: TreePine },
    ],
  },
  {
    title: "Administration",
    items: [
      { href: "/admin", label: "Admin Panel", icon: Shield },
      { href: "/admin/users", label: "Manage Users", icon: Users },
      { href: "/admin/reports", label: "Reports", icon: Flag },
      { href: "/admin/fines", label: "Fines", icon: AlertTriangle },
    ],
  },
  {
    title: "Account",
    items: [
      { href: "/payments", label: "Payments", icon: CreditCard },
      { href: "/profile", label: "My Profile", icon: User },
    ],
  },
];

// ── Super Admin Navigation ────────────────────────────────────────
export const superAdminNavSections: NavSection[] = [
  {
    title: "Command Center",
    items: [
      { href: "/home", label: "Dashboard", icon: Home },
      { href: "/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/admin", label: "Admin Panel", icon: Shield },
    ],
  },
  {
    title: "Content Management",
    items: [
      { href: "/blog", label: "Blog", icon: BookOpen },
      { href: "/forum", label: "Forum", icon: MessageSquare },
      { href: "/news", label: "News", icon: Newspaper },
      { href: "/family-tree", label: "Family Tree", icon: TreePine },
    ],
  },
  {
    title: "Administration",
    items: [
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/reports", label: "Reports", icon: Flag },
      { href: "/admin/fines", label: "Fines", icon: AlertTriangle },
      { href: "/admin/testimonials", label: "Testimonials", icon: Heart },
      { href: "/admin/notifications", label: "Notifications", icon: Bell },
    ],
  },
  {
    title: "System",
    items: [
      { href: "/admin/system", label: "System Health", icon: Activity },
      { href: "/admin/database", label: "Database", icon: Database },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
  {
    title: "Account",
    items: [
      { href: "/payments", label: "Payments", icon: CreditCard },
      { href: "/profile", label: "My Profile", icon: User },
    ],
  },
];
