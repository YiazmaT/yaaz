"use client";
import {useState} from "react";
import {useTheme} from "@mui/material";
import {usePathname} from "next/navigation";
import {useNavigate} from "@/src/hooks/use-navigate";
import {useYaazAuth} from "@/src/contexts/auth-context";
import {useTranslate} from "@/src/contexts/translation-context";
import {MenuItem} from "./types";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";

const menuItems: MenuItem[] = [
  {name: "yaaz.tenants", route: "/yaaz/tenants", icon: <StorefrontOutlinedIcon />},
];

const DEFAULT_LOGO = "/assets/icon.png";
const DEFAULT_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME || "";

export function useYaazAuthenticatedLayout() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const {logout} = useYaazAuth();
  const {navigate} = useNavigate();
  const {translate} = useTranslate();
  const theme = useTheme();
  const pathname = usePathname();

  const tenantLogo = DEFAULT_LOGO;
  const tenantName = DEFAULT_NAME;

  function toggleCollapse() {
    setIsCollapsed(!isCollapsed);
  }

  function handleMobileMenuToggle() {
    setMobileMenuOpen(!mobileMenuOpen);
  }

  function handleNavigate(route: string) {
    navigate(route);
  }

  function handleMobileNavigate(route: string) {
    navigate(route);
    setMobileMenuOpen(false);
  }

  function handleMobileLogout() {
    setMobileMenuOpen(false);
    logout();
  }

  function toggleExpandedMenu(menuName: string) {
    setExpandedMenu((prev) => (prev === menuName ? null : menuName));
  }

  function isMenuExpanded(item: MenuItem): boolean {
    if (expandedMenu === item.name) return true;
    if (item.children) {
      return item.children.some((child) => child.route && pathname.startsWith(child.route));
    }
    return false;
  }

  function isActiveRoute(route: string): boolean {
    return pathname === route || pathname.startsWith(route + "/");
  }

  return {
    isCollapsed,
    mobileMenuOpen,
    menuItems,
    theme,
    translate,
    tenantLogo,
    tenantName,
    pathname,
    toggleCollapse,
    handleMobileMenuToggle,
    handleNavigate,
    handleMobileNavigate,
    handleMobileLogout,
    logout,
    expandedMenu,
    toggleExpandedMenu,
    isMenuExpanded,
    isActiveRoute,
  };
}
